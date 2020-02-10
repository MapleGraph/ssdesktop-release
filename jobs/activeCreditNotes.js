async function activeCreditNotes() {
	let lastLogIDCreditNote = 0;
	var lastLogID = 0;
	let creditNotesArray = [];

	lastLogIDCreditNote = await new Promise((resolve,reject)=>{

         db.get("SELECT * FROM sharedPref Where key = 'lastLogIDCreditNote'", function (err, rows) {

			if (rows) {
				resolve(rows['value']);
			} else {

				// set default lastLogID
				
					let query = "INSERT INTO sharedPref (ID, key, value) values(null, 'lastLogIDCreditNote', 0)";
					db.run(query, function(err){
	                        if(err){
	                        	console.log(err);
	                        	resolve(0);
	                        }
	                    });

			}

		});

	});

	let data = {
		storeID: storeID,
		lastLogID: lastLogIDCreditNote
	};

	// get last log ID online
	let pendingPICountsData = await api.postWithoutStore('pendingPICounts', data);

	if (pendingPICountsData['data']['status'] == true) {
		lastLogID = pendingPICountsData['data']['lastCreditNoteID'];
	}
	console.log('lastLogID: ' + lastLogID + ' lastLogIDCreditNote:' + lastLogIDCreditNote);
	if (lastLogID > lastLogIDCreditNote) {
		let response = await api.postByChain('activeCreditNotes', data);
		var responseData = response['data'];
		creditNotesArray = responseData['data'];
	}


	if (creditNotesArray.length > 0) {

		 creditNotesArray = creditNotesArray.map(obj => (
							 	{ 
							 		ID: null, 
							 		creditNoteID: obj.creditNoteID,
							 		customerID: obj.customerID, 
							 		childPartyCode: obj.partyCode, 
							 		amount: obj.amount, 
							 		type: obj.creditNoteType, 
							 		description: obj.creditNoteDesc, 
							 		creationTime: obj.creditPaymentTimeLocal,
							 		isActive : 1
							 	}
							 	));

		 console.log(creditNotesArray);

		var creditNoteQuery = squel.insert()
			.into("creditNotes")
			.setFieldsRows(creditNotesArray)
			.toString();
			console.log('creditNoteQuery')
			console.log(creditNoteQuery);

		var lastLogIDQuery = `UPDATE sharedPref SET value = ${lastLogID} Where key ='lastLogIDCreditNote'`;

		var statements = [creditNoteQuery, lastLogIDQuery];

		db.runBatchAsync(statements).then(results => {
			console.log("CRNOTE SUCCESS!")
		}).catch(err => {
			console.error("BATCH FAILED: " + err);
		});


	}
}
module.exports.activeCreditNotes = activeCreditNotes;