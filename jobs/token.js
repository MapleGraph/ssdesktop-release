const axios = require('axios');
const si = require('systeminformation');

async function updateToken()
{

    var lastLogIDPI = await new Promise((resolve,reject)=>{

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

	var data = {
		storeID: storeID,
		lastLogID: lastLogIDPI
	};

	try{
		var response = await api.postWithoutStore('pendingPICounts', data);
		console.log(response)
	}
	catch(error){
		console.log(error.response)
		if(error.response.status = 401){
			renewToken();
			return false;
		}
	}

}

async function renewToken()
{
	console.log('renewToken')

	var systemInfo = await si.system()

	var clientID = localStorage.getItem('clientID');
	var clientSecret = localStorage.getItem('clientSecret');
	var fingerprint = localStorage.getItem('serialNumber');

	var obj = {
		grant_type:'client_credentials',
		serialNumber: fingerprint,
		client_id: clientID,
		client_secret: clientSecret,
		deviceSerialNumber: systemInfo.serial,
		manufacturer: systemInfo.manufacturer,
		modelNumber: systemInfo.model
	}
	
	console.log(obj)

	try{
		var token = await api.postWithoutHeaders('/oauth/token',obj)
		console.log('token response',token)
	}
	catch(error){
		console.log(error.response)
		return false;
	}

	localStorage.setItem('access_token',token.data.access_token)
}

module.exports = {updateToken}