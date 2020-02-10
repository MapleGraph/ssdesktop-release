
async function getGetActivePODetail() {

	let lastLogIDPO = 0;
	var lastLogID = 0;
	let activePODetails = [];
	let batchVariantList = [];
	let batchVarArray = [];
	let insertArray = [];
	let updateBatchVarArray = [];
	let insertBatchVarArray = [];

	lastLogIDPO = await new Promise((resolve, reject)=>{

		db.get("SELECT * FROM sharedPref Where key = 'lastLogIDPO'", function (err, rows) {

		if (rows) {
			resolve(rows['value']);
		} else {

			// set default lastLogID
			
				let query = "INSERT INTO sharedPref (ID, key, value) values(null, 'lastLogIDPO', 0)";
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
		lastLogID: lastLogIDPO
	};

	// get last log ID online
	let pendingPOCountsData = await api.postWithoutStore('pendingPOCounts', data);

	if (pendingPOCountsData['data']['status'] == true) {
		lastLogID = pendingPOCountsData['data']['lastLogID'];
	}

	console.log('lastLogID :' + lastLogID + " lastLogIDPO: " + lastLogIDPO);

	// get active PI details
	if (lastLogID > lastLogIDPO) {
		let response = await api.postByChain('activePurchaseOrderDetail', data);
		var responseData = response['data'];
		if (responseData) {
			activePODetails = response['data']['purchaseOrder'];
			batchVariantList = response['data']['batchVariantList'];
			batchVarArray = response['data']['batchVarArray'];
		}
	} else {

		return false;
	}

	// 
	if (responseData) {

		activePODetails.forEach(function (value, index) {

			let purchaseOrderID = value['purchaseOrderSummary'][0]['purchaseOrderID'];
			let status = value['purchaseOrderSummary'][0]['Status'];
			let isActive = 1;
			let json = JSON.stringify(value);
			let batchjson = JSON.stringify(batchVariantList);


			let temp = {};
			temp.ID = null;
			temp.purchaseOrderID = purchaseOrderID;
			temp.lastLogID = lastLogID;
			temp.json = json;
			temp.status = status;
			temp.batchjson = batchjson;
			temp.isActive = isActive;
			insertArray.push(temp);

		});


		var POQuery = squel.insert()
			.into("poSummary")
			.setFieldsRows(insertArray)
			.toString();

		var lastLogQuery = `UPDATE sharedPref SET value = ${lastLogID} Where key ='lastLogIDPO'`;


		// batch variant insertion and updation
		var batchVariantQuery = [];

		batchVariantList.forEach(function (value, index) {
			delete value.mrpPerUnit;
			delete value.cpLinkage;
			let batchVariantID = value.batchVariantID;
			let batchVarRefID = value.batchVarRefID;
			let batchVariantName = value.batchVariantName;
			let productID = value.productID;
			let variantID = value.variantID;
			let productName = value.productName;
			let variantName = value.variantName;
			let barcode = value.barcode;
			let serialNumber = value.serialNumber;
			let remarks = value.remarks;
			let manufacturingDate = `'${value.manufacturingDate}'`;
			let expiryDate = `'${value.expiryDate}'`;
			let inventory = value.inventory;
			let inventoryCost = value.inventoryCost;
			let sbomFlag = value.sbomFlag;
			let sbomDesc = value.sbomDesc;
			let isActive = 1;
			if (index == 0) {
				batchVariantQuery.push(`REPLACE INTO batchProductVariants (batchVariantID, batchVarRefID, batchVariantName, productID, variantID, productName, variantName, barcode, serialNumber, remarks, manufacturingDate, expiryDate, inventory, inventoryCost, sbomFlag, sbomDesc, isActive) VALUES(${batchVariantID}, ${batchVarRefID}, '${batchVariantName}', ${productID}, ${variantID}, '${productName}', '${variantName}', '${barcode}', '${serialNumber}', '${remarks}', ${manufacturingDate}, ${expiryDate}, ${inventory}, ${inventoryCost}, ${sbomFlag}, '${sbomDesc}', ${isActive})`);
			} else {
				batchVariantQuery.push(`(${batchVariantID}, ${batchVarRefID}, '${batchVariantName}', ${productID}, ${variantID}, '${productName}', '${variantName}', '${barcode}', '${serialNumber}', '${remarks}', ${manufacturingDate}, ${expiryDate}, ${inventory}, ${inventoryCost}, ${sbomFlag}, '${sbomDesc}', ${isActive})`);
			}

		});

		console.log(batchVariantQuery);
		console.log('batchVariantQuery');

		var statements = [batchVariantQuery.toString(), POQuery, lastLogQuery];

		db.runBatchAsync(statements).then(results => {
			console.log("PO SUCCESS!")
		}).catch(err => {
			console.error("BATCH FAILED: " + err);
		});


	}
}

module.exports.getGetActivePODetail = getGetActivePODetail;