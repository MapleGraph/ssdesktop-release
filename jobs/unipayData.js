    // const sqlite3 = require('sqlite3').verbose();
    // const db = new sqlite3.Database('ssDB');
    const os = process.env.os;
    var basepath = process.env.basepath;
    let dbPath = basepath
    if (dbPath.indexOf('app.asar') > -1 || os === 'WINDOWS') {
      dbPath =  dbPath.replace('app.asar', '')
    }
    dbPath += '/ssDB';
    
    
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(dbPath);
    
    var unipayResponse,debt,credit;
    
    var pointsQuery = `SELECT SUM(case when transactiontype like 'EARNED' and transactionstatus not like 'FAILURE' then amount else 0.00 end) AS pointsEarned,
    SUM(case when transactiontype like 'REDEEMED' and transactionstatus not like 'FAILURE' then amount else 0.00 end) AS pointsRedeemed,
    SUM(case when transactiontype like 'READJUSTED' and transactionstatus not like 'FAILURE' then amount else 0.00 end) AS pointsReadjusted from unipayLedger`;

    async function unipayUIUpdate(){

        // return new Promise((resolve,reject)=>{

        //     db.serialize(function(){

            
        //         db.get(pointsQuery,function(err,res){

        //             if(err){
        //                 console.log('error ',err)
        //             }
        //             else{
        //                 unipayResponse = res;
        //             }
        //         })

        //         var debtsQuery = `SELECT SUM(amount) as activeDebts from unipayLedger where transactiontype like 'READJUSTED' and transactionstatus like 'HOLD'`;

        //         db.get(debtsQuery,function(err,res){

        //             if(err){
        //                 console.log('debts error ',err)
        //             }
        //             else{
        //                 if(res.activeDebts == null){
        //                     debt = 0;
        //                 }
        //                 else{
        //                     debt = res.activeDebts;
        //                 }
        //                 unipayResponse.debit = debt;
        //             }
        //         })

        //         var creditsQuery = `SELECT SUM(amount) as activeCredits from unipayLedger where transactiontype like 'EARNED' and transactionstatus like 'HOLD'`;

        //         db.get(creditsQuery,function(err,res){

        //             if(err){
        //                 console.log('credit error ',err)
        //             }
        //             else{
        //                 if(res.activeCredits == null){
        //                     credit = 0;
        //                 }
        //                 else{
        //                     credit = res.activeCredits;
        //                 }
        //                 unipayResponse.credit = credit;
        //             }

        //             var totalPoints = unipayResponse.pointsEarned + unipayResponse.pointsRedeemed - unipayResponse.pointsReadjusted;

        //             resolve(unipayResponse);
        //         })

        //     })

        // })

        // var data = {
        //     storeID : 126,
        //     lastLogID : 1465
        // }

        // let response = await api.postByChain('unipayAPITransactions', data);
		// console.log(response)

		// var unipay =  {
		// 	totalActiveDebit: response.data.totalActiveDebit,
		// 	totalActiveCredit: response.data.totalActiveCredit,
		// 	totalReedemPoint: response.data.totalReedemPoint,
		// 	unipayBalance: response.data.unipayBalance,
		// 	unipayHoldPoints: response.data.unipayHoldPoints,
		// }

        // unipay = JSON.stringify(unipay);
        // console.log(unipay)
		// localStorage.setItem('unipay',unipay);

    }

    async function pointsResponse(){

        return new Promise((resolve,reject)=>{

            db.get(pointsQuery,function(err,res){

                if(err){
                    console.log('error ',err)
                    reject();
                }
                else{
                    unipayResponse = res;
                    resolve(unipayResponse);
                }
            })
        })
    }

module.exports = {
    unipayUIUpdate:unipayUIUpdate,
    pointsResponse:pointsResponse
}