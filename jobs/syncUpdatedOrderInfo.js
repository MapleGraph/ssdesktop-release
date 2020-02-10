function syncUpdatedOrderInfo() {

       
      var orderArray = [];

      db.all("SELECT * FROM UpdatedOrderInformation Where isSync = 0", async function(err, rows){

            if(err){
                console.log(err);
                db.exec('ROLLBACK');
                return false;
            }
            else{

              orderArray = rows;
              console.log(orderArray)

              for(let i=0;i<orderArray.length;i++)
              {              
                var obj = orderArray[i];
                var id = obj.ID;
                var json = JSON.parse(obj.orderInformation);
                var orderID = json.orderID;
                var deviceID = json.deviceID;

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

                console.log('id',id)
                console.log(orderID)
                // console.log(json);
                // console.log('originalOrder',originalOrder)

                json = JSON.stringify(json);

                var req = {
                  storeID,
                  timezone:"Asia/Kolkata",
                  orderID,
                  deviceID,
                  requestType: "UPDATE_ORDER",
                  source: "DESKTOP",
                  JSON: json
                }

                console.log(req)
                // return false;

                if(originalOrder.isSync){

                  try{
                    let response = await api.postWithStore('orderRequestTracker',req);
                    console.log('response');
                    console.log(response);

                    if(response['data'] && response['data']['status'] == true){
                          db.exec('BEGIN');
                          db.run(`UPDATE UpdatedOrderInformation SET isSync = 1 Where ID = ${id}`, function(err){
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

module.exports.syncUpdatedOrderInfo = syncUpdatedOrderInfo;