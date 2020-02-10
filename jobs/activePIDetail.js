
async function getGetActivePIDetail() {

	let lastLogIDPI = 0;
	var lastLogID = 0;
	let activePIDetailArray = [];

	lastLogIDPI = await new Promise((resolve,reject)=>{

		db.get("SELECT * FROM sharedPref Where key = 'lastLogIDPI'", function (err, rows) {

			if (rows) {
				resolve(rows['value'])
			} else {

				// set default lastLogID
				
				let query = "INSERT INTO sharedPref (ID, key, value) values(null, 'lastLogIDPI', 0)";
				db.run(query, function(err){
					if(err){
						console.log(err);
						resolve(0);
					}
				});
			}

		});

	})

	// lastLogIDPI = 0;

	let data = {
		storeID: storeID,
		lastLogID: lastLogIDPI
	};

	console.log('req obj',data)
	// return false;
	// get last log ID online
	let pendingPICountsData = await api.postWithoutStore('pendingPICounts', data);

	console.log('lastLogIDPI',lastLogIDPI)
	console.log('pendingPICountsData',pendingPICountsData)

	if (pendingPICountsData['data']['status'] == true) {
		lastLogID = pendingPICountsData['data']['lastLogID'];
	}

	// get active PI details
	if (lastLogID > lastLogIDPI) {
		let response = await api.postByChain('activePIDetail', data);
		activePIDetailArray = response['data']['invoice'];
	} else {

		return false;
	}

	console.log('activePIDetailArray',activePIDetailArray)
	// 
	if (activePIDetailArray.length > 0) {
		let insertArray = [];
		activePIDetailArray.forEach(function (value, index) {

			let proformaInvoiceID = value['PISummary'][0]['proformaInvoiceID'];
			let status = value['PISummary'][0]['status'];
			let isActive = value['PISummary'][0]['isActive'];
			let json = JSON.stringify(value);

			let temp = {};
			temp.ID = null;
			temp.proformaInvoiceID = proformaInvoiceID;
			temp.lastLogID = lastLogID;
			temp.json = json;
			temp.status = status;
			temp.isActive = isActive;
			insertArray.push(temp);

		});

		var PIquery = squel.insert()
			.into("piSummary")
			.setFieldsRows(insertArray)
			.toString();

		var lastLogIDQuery = `UPDATE sharedPref SET value = ${lastLogID} Where key ='lastLogIDPI'`;

		var statements = [PIquery, lastLogIDQuery];

		db.runBatchAsync(statements).then(results => {
			console.log("PI SUCCESS!")
		}).catch(err => {
			console.error("BATCH FAILED: " + err);
		});


	}
}

module.exports.getGetActivePIDetail = getGetActivePIDetail;