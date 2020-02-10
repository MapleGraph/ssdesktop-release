function syncStockTransaction() {

       
       var stockTransactionArray = [];

       
       db.all("SELECT * FROM stockTransactionSummary Where isSync = 0", async function(err, rows){

                 if(err){
               	  	 console.log(err);
               	  	 db.exec('ROLLBACK');
               	  	 return false;
               	  }
               	  else{
                   stockTransactionArray = rows;
               	  }
            
                   console.log('stockTransactionArray',stockTransactionArray)

                   for(let i=0;i<stockTransactionArray.length;i++)
                  {
                      var obj = stockTransactionArray[i];
                      var json = JSON.parse(obj['json']);
                      var stockTransactionID = obj['ID'];                  
                      var response = await api.postByChain('stockTransaction', json);

                      if(response['data']['status'] == true){

                        let transactionID = response['data']['transactionID'];

                        await new Promise((resolve,reject)=>{

                          db.run(`UPDATE stockTransactionSummary SET isSync = 1, transactionID = ${transactionID}  Where ID = ${stockTransactionID}`, function(err){
                            
                            if(err){
                              console.log(err);
                              resolve();
                            }
                            else{
                              resolve();
                            }
                          
                          });

                        })
                      }

                      else if(response.data.message == "Purchase Order already fulfilled" || response.data.message == "Invalid Purchase Order"){

                        await new Promise((resolve,reject)=>{

                          db.run(`UPDATE stockTransactionSummary SET isSync = 1 Where ID = ${stockTransactionID}`, function(err){
                            
                            if(err){
                              console.log(err);
                              resolve();
                            }
                            else{
                              resolve();
                            }

                          });

                        })

                      }

                  }

       });

}

module.exports.syncStockTransaction = syncStockTransaction;