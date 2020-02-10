async function syncOrderInfo() {

      
      var stockRequisitionSummary = await new Promise((resolve,reject)=>{
       
        db.all(`SELECT * FROM stockRequisitionSummary`,function(err,data){

          if(err){
            console.log(err);
          }
          else{
            resolve(data);   
          }
        })
      })

      var stockTransactionSummary = await new Promise((resolve,reject)=>{
       
        db.all(`SELECT * FROM stockTransactionSummary`,function(err,data){

          if(err){
            console.log(err);
          }
          else{
            resolve(data);   
          }
        })
      })

      var allow = true;

      for(let i=0;i<stockRequisitionSummary.length;i++)
      {
        if(stockRequisitionSummary[i].isSync == 0){
          allow = false;
          break;
        }
      }

      for(let i=0;i<stockTransactionSummary.length;i++)
      {
        if(stockTransactionSummary[i].isSync == 0){
          allow = false;
          break;
        }
      }

      if(!allow){
        return false;
      }
      
      console.log('allow',allow)

      var orderArray = [];
       
      db.all("SELECT * FROM OrderInformation Where isSync = 0", function(err, rows){

                 if(err){
               	  	 console.log(err);
               	
               	  	 return false;
               	  }
               	  else{
                    orderArray = rows;
                   }
                   
                  console.log(orderArray)

                  orderArray.forEach( async function (obj){ 
                    
                      var orderID = obj['ID'];
                      var json = JSON.parse(obj['orderInformation']);

                      console.log('orderID',orderID)
                      console.log(json)

                      try{
                        var response = await api.postWithStore('order',json);
                        var statusCode = '';

                                                
                        if(response.response){
                          console.log(response.response)
                          statusCode = response.response.data.orderCreationReport.orderId;
                          console.log(statusCode);
                        }

                        if((response['data'] && response['data']['orderCreationReport']['status'] == 'Created') || statusCode == "Already Present (Incorrect)"){
                              db.exec('BEGIN');
                              db.run(`UPDATE OrderInformation SET isSync = 1 Where ID = ${orderID}`, function(err){
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
                  }, 
                  function(err) {
                    if(err)
                    {
                      console.log(err);
                      db.exec('ROLLBACK');
                    }
                    else{
                          db.exec('COMMIT');
                        }

                  }); 

      });

}

module.exports.syncOrderInfo = syncOrderInfo;