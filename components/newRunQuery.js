const $ = require("jquery");
const axios = require('axios');
const basepath = process.env.basepath
console.log(basepath)
const api = require(basepath + '/helpers/apiCall.js');
//const squel = require("squel");
//const squelMysql = squel.useFlavour('mysql');
const sqlite3 = require('sqlite3').verbose();
require('../assets/js/moment.min.js')
const os = process.env.os
let dbPath = basepath
if (dbPath.indexOf('app.asar') > -1 || os === 'WINDOWS') {
    dbPath = dbPath.replace('app.asar', '')
}
dbPath += '/ssDB';

console.log(dbPath);
// process.env.dbPath = dbPath;
const db = new sqlite3.Database(dbPath);

const routeList = require('../helpers/routeList');

var store = JSON.parse(localStorage.getItem('loginResponse'));
var serialNumber = localStorage.getItem('serialNumber');

var storeID = store.storeList[0].storeID;
var schema,query,tables,globalTypeValues,noResponse = false,updateSchema;
var counts,count;
var method,tableName,routeName,rows,data={key:'dummy'};


async function main()
{
    await api.get('productCount')
    .then((res)=>{

        counts = res.data;
        console.log(counts)
    })

    await api.schemaCall('appSchemaInfo')
    .then((res)=>{        
    
        tables = res.data.data;      
        console.log(tables) 
    })


        
    for(let i=0;i<tables.length;i++)
    {
        
        query = tables[i].query;
        updateSchema = tables[i].updateSchema;

        if(updateSchema){

            await new Promise(function(resolve,reject){

                db.run(`DROP TABLE ${tables[i].tableName}`,function(error){
                    if(error){
                        console.log("error in droping table",error,tables[i].tableName)
                    }
                    else{
                        console.log(`drop table ${tables[i].tableName}`)
                        resolve();
                    }
                });
            })
        }

        await new Promise(function(resolve,reject){

            db.run(query,function(error){
                if(error){
                    console.log("error in creating table",error,tables[i].tableName)
                }
                else{
                    resolve();
                }
            });
        })

    }

    console.log('main finish')
    insert();
}


async function insert(){

    console.log('insert called')

    for(let i=0;i<routeList.length;i++){

        route = routeList[i];
        var exit = false;
        totalRoutes = routeList.length
        routeProgress = (i)*100/totalRoutes
        
        $('#tableSync').text(route.label)
        var width = 0;
        var elem = document.getElementById("myBar");   
        width=routeProgress.toFixed(0);
        elem.style.width = width + '%'; 
        elem.innerHTML = width * 1  + '%';
        

        switch(route.routeName)
        {

            case 'getChainInfo':
            method = api.getByChain;
            break;

            case 'getVendors':
            method = api.getByChain;
            break;

            case 'getWarehouses':
            method = api.getByChain;
            break;

            case 'getStoreListApp':
            method = api.getByChain;
            break;

            case 'getDamageClaimList':
            method = api.getByChain;
            break;

            case 'customerInfoApp':
            method = api.getByChain;
            break;

            case 'getMaxLogID':
            method = api.getByChain;
            break;

            case 'getRemarksApp':
            method = api.getByChain;
            break;

            case 'getStoreRegionPricing':
            method = api.postByChain;
            data = {
                    storeID:storeID,
                    limit:10000,
                    offset:0
            }
            count = Math.ceil(counts.storeRegionProdCount/10000);
            break;

            case 'devices':
            method = api.getBySerialNumber;
            break;

            case 'getAppSettings':
            method = api.getByDeviceID;
            break;

            case 'lastorder':
            method = api.getByDeviceIDStoreID;
            break;

            case 'getLicenseInfo':
            method = api.getLicenseInfo;
            break;

            // case 'inventoryLevel':
            // method = api.postByChain;
            // data = {
            //     sourceID:storeID,
            //     sourceType:'STORE'
            // }
            // break;

            case 'getStockTransferRule':
            method = api.postByChain;
            data = {
                sourceID:storeID,
                sourceType:'STORE'
            }
            break;

            case 'getWarehouses':
            method = api.getByChain;
            break;

            case 'getProductsBatchVariants':
            method = api.getByChainOffset;
            data = {
                    limit:10000,
                    offset:0
            }
            count = Math.ceil(counts.batchVariantCount/10000);
            break;

            case 'heartbeat':
            method = api.heartbeat;
            data = {
                chainID:1,
                licenseNumber: store.licenseNumber,
                serialNumber,
                storeID: store.storeList[0].storeID,
                lastSyncTime:"",
                apkVersion: 1,
                appName: "SS-DESKTOP"
            }
            console.log(data)
            break;            

            default : method = api.get;
        }

            
        if(route.routeName == 'getProductsBatchVariants' || route.routeName == 'getStoreRegionPricing')
        {

            await offsetCaller(route,method,data,count);
            continue;
        }        

        await method(route.routeName,data)
        .then(async(res)=>{ 
            console.log(route.routeName + ' response');
            console.log(res.data);

            if(res.data != undefined){

                switch(route.routeName)
                {
                    case 'chargeList': 
                    rows = res.data.taxList;
                    break;

                    case 'employees':
                    rows = res.data.employeesList;
                    break;

                    case 'getStoreInfo':
                    rows = res.data.storeDetails;
                    break;

                    case 'accounts':
                    rows = res.data.accountsInformation;
                    break;

                    case 'payments':
                    rows = res.data.payments;
                    break;

                    case 'global':
                    rows = res.data.globalTypeInformation;
                    globalTypeValues = res.data.globalTypeInformation;
                    break;

                    case 'globaltypes':
                    rows = res.data.globalTypeInformation
                    break;

                    case 'productsTest':
                    rows = res.data.productList;
                    break;

                    case 'categories':
                    rows = res.data.categoryList;
                    break;

                    case 'brands':
                    rows = res.data.brandList;
                    break;
                    
                    case 'discounts':
                    rows = res.data;
                    break;

                    case 'getWarehouses':
                    rows = res.data.warehouseList;
                    break;

                    case 'payments':
                    rows = res.data.payments;
                    break;            

                    case 'devices':
                    rows = res.data.devices;
                    localStorage.setItem('deviceID',rows[0].deviceID)
                    break;

                    case 'getAppSettings':
                    localStorage.setItem('AppSettings',JSON.stringify(res.data));
                    exit = true;
                    break;

                    case 'getMaxLogID':
                    localStorage.setItem('MaxLogID',JSON.stringify(res.data));
                    exit = true;
                    break;

                    case 'getRemarksApp':
                    rows = res.data.remarkTypes;
                    break;

                    case 'lastorder':

                    console.log('lastorder',res);
                    var currentDate = moment().format('YYYY-MM-DD','Asia/Kolkata');                   

                    if(res.data.orderID == undefined){
                        localStorage.setItem('lastOrder',0);
                        localStorage.setItem('refundOrderID',0)
                        localStorage.setItem('stockRequestNumber',res.data.stockRequestNumber)
                        localStorage.setItem('stockRequestDate',currentDate)
                    }
                    else{
                        var orderID = res.data.orderID;
                        var refundOrderID = res.data.refundOrderID;

                        var a = orderID.split('-');
                        orderID = parseInt(a[1]);

                        var b = refundOrderID.split('-');
                        refundOrderID = parseInt(b[2]);

                        localStorage.setItem('lastOrder',JSON.stringify(orderID));
                        localStorage.setItem('refundOrderID',JSON.stringify(refundOrderID));
                        localStorage.setItem('stockRequestNumber',res.data.stockRequestNumber);
                        localStorage.setItem('stockRequestDate',currentDate);
                    }
                    exit = true;
                    break;

                    case 'getLicenseInfo':
                    localStorage.setItem('licenseInfo',JSON.stringify(res.data));
                    exit = true;
                    break;

                    case 'getStockTransferRule':
                        
                        if(res.data.status){
                            rows = res.data.data;
                        }
                        else{   
                            exit = true;
                        }

                    break;

                    case 'getMocsApp':
                    rows = res.data.mocList;
                    break;

                    case 'heartbeat':
                    localStorage.setItem('apkVersion',res.data.apkVersion);
                    exit = true;
                    break;

                    default : rows = res.data.data;
                }

            }    
            else {
                noResponse = true;
            }
            
        }).catch(err=>{
            if(err){
                const dialogOptions = {type: 'info', buttons: ['OK'], message: 'Error in data syncing, Please login again'}
                dialog.showMessageBox(dialogOptions, async i => {
                    if(!i){
                        $('#syncFailedBtn').css('display','flex')
                        localStorage.setItem('dataSynced',false)
                    }
                })
                console.log("error",err);   
            }
        })

        if(noResponse){

            console.log('noResponse')
            
            var options = {type: 'info', buttons: ['OK'], message: 'Error in data syncing, Please login again'}
            dialog.showMessageBox(options, async i => {
                if(!i){
                    $('#syncFailedBtn').css('display','flex')
                    localStorage.setItem('dataSynced',false)
                }
            })
            
            break;
        }

        if(exit){
            continue;
        }

        if (typeof(rows) == "undefined" || rows.length == 0) {
            continue;
        }
        
        // console.log(route.routeName + ' response ',rows)

        if(route.routeName == 'discounts'){

            for(let j in rows)
            {   
                console.log(j,rows[j])

                if(rows[j].length == 0)
                {
                    continue;
                }

                if(j == 'discountMaster' || j == 'discountCustomerMap' || j == 'discountProductMap' || j == 'discountLevel' || j == 'discountClusters')
                {
                    await queryBuilder(j,j,rows[j])
                }
            }
        }
        else if(route.routeName == 'getWarehouses'){

            var result,tableName;

            await queryBuilder(route.tableName,route.routeName,rows);

            for(let j=0;j<rows.length;j++)
            {
                var path = 'getWareProductsBatchVariants/'+rows[j].warehouseID;
                var res = await api.getByChain(path);

                result = res.data.data;

                if(rows[j].warehouseType == 'CENTRAL'){
                    tableName = 'cw_productBatchVariant';
                }
                else if(rows[j].warehouseType == 'DAMAGED'){
                    tableName = 'dw_productBatchVariant';
                }
                else if(rows[j].warehouseType == 'EXPIRED'){
                    tableName = 'ew_productBatchVariant'
                }

                console.log(tableName,result)
                await queryBuilder(tableName,tableName,result)
            }

            // method = api.getByChainOffset;
            // count = 5;

            // for(let j=0;j<1;j++)
            // {
            //     var path = 'getWareProductsBatchVariants/'+rows[j].warehouseID;
            //     var x;
            //     var req = {
            //         offset:0,limit:10000
            //     }

            //     if(rows[j].warehouseType == 'CENTRAL'){
            //         tableName = 'cw_productBatchVariant';
            //     }
            //     else if(rows[j].warehouseType == 'DAMAGED'){
            //         tableName = 'dw_productBatchVariant';
            //     }
            //     else if(rows[j].warehouseType == 'EXPIRED'){
            //         tableName = 'ew_productBatchVariant'
            //     } 

            //     x = {
            //         routeName: path,
            //         tableName
            //     }

            //     await offsetCaller(x,method,req,count);
            // }


        }
        else if(route.routeName == 'customerInfoApp'){

            await queryBuilder(route.tableName,route.routeName,rows)

            var allPartyCodes = [];

            for(let i=0;i<rows.length;i++)
            {
                var partyCodes = rows[i].partyCodes;
                allPartyCodes = allPartyCodes.concat(partyCodes);
            }

            await queryBuilder('customersPartyCode','customersPartyCode',allPartyCodes)
        }
        else{
            await queryBuilder(route.tableName,route.routeName,rows)
        }

        if(route.routeName == 'global')
        {
            for(let j=0;j<globalTypeValues.length;j++)
            {
                var data = globalTypeValues[j];

                if(data.typeValues.length>0)
                {
                    data.typeValues.map((x)=>{
                        x.typeID = data.typeID
                    })
                    // console.log('queryBuilder',data.typeID)
                    await queryBuilder('globalTypeValues','globalTypeValues',data.typeValues)
                }
            }
        }
        

    }

    console.log('insert finish')
    db.close(function(){
        console.log('database closed')
    });
    
    if(noResponse){

        return false;
    }

    
    let d = moment().format("ddd, MMMM Do YYYY, hh:mm A");
    localStorage.setItem('dataSynced',true)
    localStorage.setItem('lastSyncDate',d)
    window.location.href="dashboard.html";

}


async function queryBuilder(tableName,routeName,rows)
{
    let query = "PRAGMA table_info("+tableName+")";
    let deleteQuery = "DELETE FROM "+tableName;

    // console.log(query)

    return new Promise ((resolve, reject) => {

        db.all(query,async function(err,result){

            // console.log('schema '+routeName,result);
            
            required = {}
            
            // required object determines which keys from response are present in database table
            // building required object

            for(let key in rows[0]){
                for(let i=0;i<result.length;i++)
                {
                    if(key.toLowerCase() == result[i].name.toLowerCase())
                    {
                        required[key] = 'true';
                        break; 
                    }
                }        
            }

            if(routeName == 'productsTest'){
                required['inventoryAmount'] = 'true';
                required['inventoryValue'] = 'true';
            }

            if(routeName == 'customerInfoApp'){
                required['customerID'] = 'true';
            }

            // console.log('required ',required)
            // return ;

            var keyQuery,valueQuery = '',row,value;
        
            // building the columns of table 

            keyQuery = '(';
            for(let key in required)
            {
            keyQuery += ' ' + key + ',';
            }
            
            keyQuery = keyQuery.substr(0,keyQuery.length-1);
            keyQuery += ')';

            // console.log(keyQuery)

            if(routeName == 'productsTest'){
                delete required['inventoryAmount'];
                required['inventoryCost'] = 'true';
                delete required['inventoryValue'];
                required['inventory'] = 'true';
            }

            if(routeName == 'customerInfoApp'){
                delete required['customerID'];
                required['custID'] = 'true';
            }
            // console.log(required)

            // building the values to be inserted
            // row corresponds to each row of table
            // rows = rows.slice(0,1);

            for(let i=0;i<rows.length;i++)
            {
            row = '(';

            for(let key in required)
            {
                if(typeof(rows[i][key]) == 'string'){
                value = JSON.stringify(rows[i][key]);
                }
                else{
                value = rows[i][key];
                }
                row += ' ' + value + ',';
            }
            
            row = row.substring(0,row.length-1);
            row += ')';

            valueQuery += row + ',';
            
            }
            
            valueQuery = valueQuery.substring(0,valueQuery.length-1);

            var finalQuery = 'INSERT INTO '+ tableName + keyQuery+' VALUES '+valueQuery;
            // console.log(finalQuery)

            // resolve();
            // return;


            db.serialize(function(){

                if(tableName !== 'globalTypeValues' && tableName !== 'batchProductVariants' && tableName !== 'storeRegion')
                {
                    db.run(deleteQuery,function(err){
                        console.log('delete '+tableName,err)
                    });
                }

                if(tableName == 'globalType')
                {
                    db.run("DELETE FROM globalTypeValues",function(err){
                        console.log('delete globalTypeValues',err)
                    })
                }

                db.run(finalQuery,function(err){
                    console.log('insert '+tableName,err)

                    // $('#tableSync').text(tableName)
                    //resolve();

                    if(err){
                        const dialogOptions = {type: 'info', buttons: ['OK'], message: 'Error in data syncing, Please login again'}
                        dialog.showMessageBox(dialogOptions, async i => {
                            if(!i){
                                $('#syncFailedBtn').css('display','flex')
                                localStorage.setItem('dataSynced',false)
                            }
                        })
                    }
                    else{
                        resolve();
                    }
                });

            })

        })
    })

}


async function offsetCaller(route,method,data,count){

    console.log(route,data,count)
    var found = false;

    await new Promise((resolve,reject)=>{
        
        db.run('DELETE FROM '+route.tableName,function(err,data){
            if(err){
                console.log(err)
            }
            else{
                console.log('deleted '+route.tableName)
                resolve();
            }
        })
    })

    for(let i=0;i<count;i++)
    {

        console.log('req no. ',i + 1,data)
        await method(route.routeName,data)
        .then((res)=>{

            console.log(res.data)

            if(res.data.status){

                rows = res.data.data;
                data.offset += 10000;

                if(rows.length == 0){
                    found = true;
                }
            }
        })
        .catch((err)=>{

            console.log(err)
        })
        
        if(found)
        {
            console.log('found')
            break;      
        }

        await queryBuilder(route.tableName,route.routeName,rows)
    }

}


module.exports =  {
    main,
};