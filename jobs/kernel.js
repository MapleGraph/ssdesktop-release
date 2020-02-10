    //const $ = require("jquery");
    var moment = require('moment');
    var basePath = process.env.basepath;
    const api = require(basePath+'/helpers/apiCall.js');
    var store = JSON.parse(localStorage.getItem('loginResponse'));
    var storeID = store.storeList[0].storeID;
    //const sqlite3 = require('sqlite3').verbose();
    //const db = new sqlite3.Database('ssDB');
    const routeList = require(basePath+'/helpers/routeList');
    const squel = require("squel");
    const squelMysql = squel.useFlavour('mysql');

    const schedule = require('node-schedule');

    if (typeof db === 'undefined') {
        const os = process.env.os;
        var basepath = process.env.basepath;
        let dbPath = basepath
        if (dbPath.indexOf('app.asar') > -1 || os === 'WINDOWS') {
            dbPath = dbPath.replace('app.asar', '')
        }
        dbPath += 'ssDB';

        console.log("database path = " + dbPath);
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database(dbPath);
        }

    sqlite3.Database.prototype.runAsync = async function (sql, ...params) {
        return await new Promise((resolve, reject) => {
            this.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this);
            });
        });
    };

    sqlite3.Database.prototype.runBatchAsync = function (statements) {
        var results = [];
        var batch = ['BEGIN', ...statements, 'COMMIT'];
        console.log(batch);
        console.log('batch')
        return batch.reduce((chain, statement) => chain.then(result => {
            results.push(result);
            return db.runAsync(...[].concat(statement));
        }), Promise.resolve())
        .catch(err => db.runAsync('ROLLBACK').then(() => Promise.reject(err +
            ' in statement #' + results.length)))
        .then(() => results.slice(2));
    };

    const activePIDetail = require(basePath+'/jobs/activePIDetail.js');
    const activePODetail = require(basePath+'/jobs/ActivePODetail.js');
    const unipayAPITransactions = require(basePath+'/jobs/unipayAPITransactions.js');
    const syncStockRequisition = require(basePath+'/jobs/syncStockRequisition.js');
    const syncStockTransaction = require(basePath+'/jobs/syncStockTransaction.js');
    const activeCreditNotes = require(basePath+'/jobs/activeCreditNotes.js');
    const syncOrderInfo = require(basePath+'/jobs/syncOrderInfo.js');
    const syncVoidOrderInfo = require(basePath+'/jobs/syncVoidOrderInfo.js');
    const syncUpdatedOrderInfo = require(basePath+'/jobs/syncUpdatedOrderInfo.js');
    const deleteOrderSyncer = require(basePath+'/jobs/deleteOrderSyncer.js');
    const token = require(basePath+'/jobs/token.js');


      var jobs = schedule.scheduleJob('*/10 * * * * *', function(){
        try {
            activePIDetail.getGetActivePIDetail();
            activePODetail.getGetActivePODetail();
            unipayAPITransactions.unipayAPITransactions();
            syncStockRequisition.SyncStockRequistion();
            syncStockTransaction.syncStockTransaction();
            activeCreditNotes.activeCreditNotes();
            syncOrderInfo.syncOrderInfo();
            syncVoidOrderInfo.syncVoidOrderInfo();
            syncUpdatedOrderInfo.syncUpdatedOrderInfo();
            deleteOrderSyncer.deleteOrderSyncer();
            token.updateToken();
                
            } catch (error) {
                console.log("Error", error);
            }
            finally {
                // console.log("sync done");
              }
     });
        
module.exports = function() {};   
   

