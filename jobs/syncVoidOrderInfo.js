function syncVoidOrderInfo() {

       
      var orderArray = [];
       
      db.all("SELECT * FROM voidOrderInformation Where isSync = 0", async function(err, rows){

            if(err){

                console.log(err);
                db.exec('ROLLBACK');
                return false;
            }
            else{
            
                orderArray = rows;
                console.log('void orders',orderArray)

                for(let i=0;i<orderArray.length;i++)
                {                    
                    var obj = orderArray[i];
                    var id = obj.ID;
                    var json = JSON.parse(obj.orderInformation);
                    var orderID = obj.orderID;
                    var voidJSON = json.orderJSON;
                    var updated;

                    console.log('id',id)
                    console.log('void info',voidJSON)

                    var originalOrder = await new Promise((resolve,reject)=>{

                        db.get(`SELECT * FROM orderInformation where orderID = '${orderID}'`,function(err,data){

                          if(err){
                            console.log(err)
                          }
                          else{
                            resolve(data);
                          }
                        })
                    })

                    // console.log('originalOrder',originalOrder)
                    // sync only those voidOrderInfo which have been synced on the server

                    if(originalOrder.isSync){
                      
                      console.log('sync me')

                      try{
                        var response = await api.putWithStore('order/cancel',voidJSON);
                        var statusCode = '';

                        console.log('response');
                        console.log(response)

                        if(response.response){
                          console.log(response.response)
                          statusCode = response.response.data.orderUpdationReport.orderId;
                          console.log(statusCode)
                        }

                        if(response['data'] && response['data']['orderUpdationReport']['status'] == 'Updated' || statusCode == "Already Present (Correct)"){
                              db.exec('BEGIN');
                              db.run(`UPDATE VoidOrderInformation SET isSync = 1 Where ID = ${id}`, function(err){
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
                      
                      catch(error){
                        console.log(error)
                      }

                    }

                }
            }

      });

}

module.exports.syncVoidOrderInfo = syncVoidOrderInfo;