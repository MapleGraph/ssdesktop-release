//var basePath = process.env.basepath;
//const api = require(basePath+'/helpers/apiCall.js');
//const sqlite3 = require('sqlite3').verbose();
//const db = new sqlite3.Database('ssDB');
// if(typeof squel === 'undefined'){
// 	const squel = require("squel");
// }

// if(typeof squelMysql === 'undefined'){
// 	const squelMysql = squel.useFlavour('mysql');

// }

	const squel = require("squel");
	const squelMysql = squel.useFlavour('mysql');

async function unipayAPITransactions() {
	let lastLogIDUnipay = 0;
	var lastLogID = 0;
	let unipayAPITransactionsArray = [];

	lastLogIDUnipay = await new Promise((resolve,reject)=>{

        db.get("SELECT * FROM sharedPref Where key = 'lastLogIDUnipay'", function (err, rows) {

            if (rows) {
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

	// get last log ID online
	let pendingPICountsData = await api.postWithoutStore('pendingPICounts', data);

	if (pendingPICountsData['data']['status'] == true) {
		lastLogID = pendingPICountsData['data']['lastUnipayLogID'];
	}
	console.log('lastLogID: ' + lastLogID + ' lastLogIDUnipay:' + lastLogIDUnipay);
	if (lastLogID > lastLogIDUnipay) {
		let response = await api.postByChain('unipayAPITransactions', data);
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

		// var statements = [unipayQuery];

		db.runBatchAsync(statements).then(results => {
			console.log("UNIPAY SUCCESS!")
		}).catch(err => {
			console.error("BATCH FAILED: " + err);
		});


	}
}
module.exports.unipayAPITransactions = unipayAPITransactions;