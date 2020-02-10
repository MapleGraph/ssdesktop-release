//var basePath = process.env.basepath;
const api = require(basePath+'/helpers/apiCall.js');
const os = process.env.os;
var basepath = process.env.basepath;
let dbPath = basepath
if (dbPath.indexOf('app.asar') > -1 || os === 'WINDOWS') {
    dbPath = dbPath.replace('app.asar', '')
}
dbPath += '/ssDB';


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);
var store = JSON.parse(localStorage.getItem('loginResponse'));
var storeID = store.storeList[0].storeID;
const squel = require("squel");

sqlite3.Database.prototype.runAsync = function (sql, ...params) {
	return new Promise((resolve, reject) => {
		this.run(sql, params, function (err) {
			if (err) return reject(err);
			resolve(this);
		});
	});
};

sqlite3.Database.prototype.runBatchAsync = function (statements) {
	var results = [];
	var batch = ['BEGIN', ...statements, 'COMMIT'];
	console.log(batch);
	console.log('batch')
	return batch.reduce((chain, statement) => chain.then(result => {
		results.push(result);
		return db.runAsync(...[].concat(statement));
	}), Promise.resolve())
	.catch(err => db.runAsync('ROLLBACK').then(() => Promise.reject(err +
		' in statement #' + results.length)))
	.then(() => results.slice(2));
};
	
async function unipayAPITransactions() {
	let lastLogIDUnipay = 0;
	var lastLogID = 0;
	let unipayAPITransactionsArray = [];

    lastLogIDUnipay = await new Promise((resolve,reject)=>{

        db.get("SELECT * FROM sharedPref Where key = 'lastLogIDUnipay'", function (err, rows) {

            if (rows) {
                console.log(rows)
                resolve(rows['value']);

            } else {
    
                // set default lastLogID
                
                    let query = "INSERT INTO sharedPref (ID, key, value) values(null, 'lastLogIDUnipay', 0)";
                    db.run(query, function(err){
                            if(err){
                                console.log(err);
                                resolve(0);
                            }
                    });
            }
    
        });

    })
	
    let data = {
		storeID: storeID,
		lastLogID: lastLogIDUnipay
	};
    console.log('lastLogIDUnipay ',lastLogIDUnipay)

    // get last log ID online

	try{
		let pendingPICountsData = await api.postWithoutStore('pendingPICounts', data);

		if (pendingPICountsData['data']['status'] == true) {
			lastLogID = pendingPICountsData['data']['lastUnipayLogID'];
		}
		
		console.log('lastLogID: ' + lastLogID + ' lastLogIDUnipay:' + lastLogIDUnipay);

		if (lastLogID > lastLogIDUnipay) {

			console.log('call api')
			let response = await api.postByChain('unipayAPITransactions', data);
			console.log(response)
			var responseData = response['data'];
			unipayAPITransactionsArray = responseData['data'];

			var unipay =  {
				totalActiveDebit: responseData.totalActiveDebit,
				totalActiveCredit: responseData.totalActiveCredit,
				totalReedemPoint: responseData.totalReedemPoint,
				unipayBalance: responseData.unipayBalance,
				unipayHoldPoints: responseData.unipayHoldPoints,
			}

			unipay = JSON.stringify(unipay);
			localStorage.setItem('unipay',unipay);
		}

		if (unipayAPITransactionsArray.length > 0) {


			unipayAPITransactionsArray.forEach(function (value, index) {

				delete value['ssMobileNo'];
				delete value['creationTimeUTC'];
				delete value['lastUpdatedAtLocal'];
				delete value['lastUpdatedAtUTC'];
				delete value['userName'];
				delete value['phone'];
				delete value['ssCode'];
				value['isActive'] = 1;

			});

			var unipayQuery = squel.insert()
				.into("unipayLedger")
				.setFieldsRows(unipayAPITransactionsArray)
				.toString();
			
			console.log(unipayQuery);

			var lastLogIDQuery = `UPDATE sharedPref SET value = ${lastLogID} Where key ='lastLogIDUnipay'`;

			var statements = [unipayQuery, lastLogIDQuery];

			await new Promise((resolve,reject)=>{

				db.runBatchAsync(statements).then(results => {
					console.log("SUCCESS!")
					console.log(results);
					resolve();
				}).catch(err => {
					console.error("BATCH FAILED: " + err);
					reject();
				});

			})	

		}
	}
	catch(error){
		console.log(error)
	}
}

module.exports.unipayAPITransactions = unipayAPITransactions;