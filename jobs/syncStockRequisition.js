
function SyncStockRequistion() {

       
      var stockRequisitionArray = [];

       
      db.all("SELECT * FROM stockRequisitionSummary Where isSync = 0 AND isDraftMode = 0", async function(err, rows){

                 if(err){
               	  	 console.log(err);
               	  	 db.exec('ROLLBACK');
               	  	 return false;
               	  }
               	  else{
                   stockRequisitionArray = rows;
               	  }

                   console.log('stockRequisitionArray',stockRequisitionArray)

                  // stockRequisitionArray.forEach( async function (obj){ 

                  for(let i=0;i<stockRequisitionArray.length;i++)
                  {
                      var obj = stockRequisitionArray[i];

                      var json = JSON.parse(obj['json']);
                      var stockRequisitionID = obj['ID'];

                      json['stockReference'] = obj['stockReference'];
                      json['requisitionTimeLocal'] = obj['requisitionTimeLocal'];
                      json['timezone'] = obj['timezone'];

                      let response = await api.postByChain('stockRequisition', json);

                      console.log(response)

                      if(response['data']['status'] == true){
                          
                        let requisitionID = response['data']['requisitionID'];

                        db.exec('BEGIN');
                        db.run(`UPDATE stockRequisitionSummary SET isSync = 1, requisitionID = ${requisitionID} Where ID = ${stockRequisitionID}`, function(err){
                          
                          if(err){
                            db.exec('ROLLBACK');
                            console.log(err);
                          }
                          else{
                            db.exec('COMMIT');
                          }
                        });
                      }

                      else if(response.data.message == "Duplicate stockReference!"){

                        db.exec('BEGIN');
                        db.run(`UPDATE stockRequisitionSummary SET isSync = 1 Where ID = ${stockRequisitionID}`, function(err){
                          
                          if(err){
                            db.exec('ROLLBACK');
                            console.log(err);
                          }
                          else{
                            db.exec('COMMIT');
                          }
                        });
                      }
                  }                  

      });

}

module.exports.SyncStockRequistion = SyncStockRequistion;