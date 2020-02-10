function deleteOrderSyncer()
{

    db.all(`SELECT * FROM catalogueSyncTable WHERE isSync = 0`,async function(err,data){

        if(err){
            console.log(err)
        }
        else{
            
            console.log('catalogueSyncTable',data)

            for(let i=0;i<data.length;i++)
            {
                var req = JSON.parse(data[i].fieldInformation);
                console.log(req);

                try{
                    var response = await api.postByChain('updatePIStatus',req)
                    console.log(response)

                    if(response.data.status){
                        
                        db.exec('BEGIN');
                        db.run(`UPDATE catalogueSyncTable SET isSync = 1 WHERE logID = '${req.proformaInvoiceID}'`, function(err){
                            
                            if(err){
                                db.exec('ROLLBACK');
                                console.log(err);
                            }
                            else{
                                db.exec('COMMIT');
                            }
                        })
                    }
                }
                catch(error){
                    console.log(error)
                }
            }

        }
    })

}

module.exports = {deleteOrderSyncer}