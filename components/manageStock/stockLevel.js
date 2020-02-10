const basepath = process.env.basepath
const sqlite3 = require('sqlite3').verbose();

const os = process.env.os
let dbPath = basepath
if (dbPath.indexOf('app.asar') > -1 || os === 'WINDOWS') {
    dbPath = dbPath.replace('app.asar', '')
}
dbPath += '/ssDB';

console.log(dbPath);
// process.env.dbPath = dbPath;
const db = new sqlite3.Database(dbPath);
//const db = new sqlite3.Database('ssDB');
var store = JSON.parse(localStorage.getItem('loginResponse'));
var storeID = store.storeList[0].storeID;
var userID = store.userID;
var userName = JSON.parse(localStorage.getItem('phoneNumber'));
var selectedProductData=[];
var maxInventory=0;
var sourceData=[] ;
var selectedProductBatchData = [];
var cSelectedProductBatchData = [];
var filteredProductBatch = [];
var stockList = [];
var cartData = [];
var sourceValue;
var destinationValue;
var sourceName;
var destinationName;
var totalProductPrice=0;
var totalProductUnit=0;
var totalUnits = 0;
var totalPrice = 0;
var sourceType = 'STORE';
var destinationType = 'STORE';
var sourceTableName;
var destinationTableName;
var destinationRules ;
var warehouseData;
var availDestinationData = [];
var upcFactor = false;
// var normLevelApplied = false;
var filteredStockList = [];
var selectedSourceValue = 0;

var fetchingErrMsg='Error in Fetching order!!'
var placingErrMsg='Error in Placing order!'
var reRenderLocation='../dashboard.html'
var filterPacksQuery = `HAVING SUM(A.inventory) > 0`

$(async()=>{
    await getMenu('Manage Stock')
    await backNavigation()

    initiateMultiSelect()
    $('.select2').select2();
})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}


initiateMultiSelect=async()=>{

    $('#brands').multiselect('destroy');
    $('#brands').multiselect({
        enableCaseInsensitiveFiltering: true,
        includeSelectAllOption: true,
        trimOnSearch:false,
        maxHeight: 500,
        numberDisplayed: 1,
        maxwidth:150,
        dropUp: false
    })

    $("#brands").multiselect('selectAll', false);
    $("#brands").multiselect('updateButtonText');
    $('.multiselect').attr('title','')
    $('.input-group').css('display','flex')

    $('.customInputGroupAddon').addClass('flex-row')
    $('.customInputGroupAddon').css({'width':'5%','justify-content':'center'})
    $('.customSearchTableImage').css({'width':'15px'})

    $('.customMultiSelectSearch').css({'margin-top':0,'width':'80%'})

    $('.input-group-btn').addClass('flex-row')
    $('.input-group-btn').css({'width':'5%'})

    $('.multiselect-clear-filter').addClass('flex-row')
    $('.multiselect-clear-filter').css({'width':'100%','height':'35px','margin-top':'0','justify-content':'center','padding':'10px 12px'})
    $('.customSearchTableImage1').css({'width':'13px'})
}

function getData(){
    db.all('SELECT DISTINCT incomeHead FROM products',function(err,rows){
        if(err){
            console.log(err);
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            var incomeHead = rows;
            for(let i=0;i<incomeHead.length;i++)
            {
                incomeHeadValue = incomeHead[i].incomeHead;
                incomeHeadName = incomeHead[i].incomeHead;
                element = '<option value='+incomeHeadValue+'>'+incomeHeadName+'</option>'
                $('#incomeHead').append(element);
            }
            // populateBrands();
        }
    })
    db.all('SELECT * FROM wareHouses',function(err,rows){
        if(err){
            console.log(err);
          isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            warehouseData = rows;
            sourceData = warehouseData;
            if(warehouseData.length){
                $("#source").html('<option value="0">Select Source</option><option value = '+storeID+'>Main Godown</option>');
                warehouseData.map(m=>{
                    var warehouseName = m.warehouseName;
                    var warehouseID = m.warehouseID;
                    element = '<option value='+warehouseID+'>'+warehouseName+'</option>'
                    $('#source').append(element);
                    
                })
            }
            else{
                $("#source").html('<option>Select Source</option><option value = '+storeID+'>Main Godown</option>');
            }
        }
    })
    db.all(`SELECT * FROM stockTransferConf`,(err,data)=>{
        if(err){
            console.log(err);
          isError(fetchingErrMsg,reRenderLocation) 
        }
        else{
            destinationRules = data
        }
    })    

}

populateDestinations=()=>{
    $('#select2-chosen-2').html("None Selected")
    // $('#select2-chosen-2').html("Select Destination")
    $('#stockTable').bootstrapTable('destroy')
    $('#switchFilters').css('display','none')
    $('#addCartBtn').css({"display":'none'})    
    $('#destination').empty();
    sourceValue = $('#source').val();
    selectedSourceValue = sourceValue
    sourceName =$("#source option:selected").text();
    if(sourceValue!='0'){
        $('#downloadPdfBtn').css('display','flex')
        $('#printPdfBtn').css('display','flex')
    }
    else if(sourceValue=='0'){
        $('#downloadPdfBtn').css('display','none')
        $('#printPdfBtn').css('display','flex')
    }
    availDestinationData = []

    if(sourceValue != storeID){
        sourceType = 'WAREHOUSE'
    }
    else if(sourceValue == storeID){
        sourceType = 'STORE'
    }     
    console.log(sourceValue,sourceType,sourceName)

    destinationRules.map(m=>{
        if(m.sourceID == sourceValue && m.sourceType == sourceType && m.isActive){
            console.log(m.destinationID,storeID )
            if(m.destinationID == storeID){
                obj = {
                    'warehouseName': 'Main Godown',
                    'warehouseID': storeID
                }
                availDestinationData.push(obj)
            }
            var availObj = warehouseData.find(n=>n.warehouseID ==m.destinationID)
            if(availObj){
                availDestinationData.push(availObj)
            }
        }
    })

    console.log(availDestinationData,'availDestinationData',destinationRules,'destinationRules')

    if(availDestinationData.length){
        $("#destination").html('<option value="0">None Selected </option>');
        // $("#destination").html('<option value="0">Select Destination </option>');
        availDestinationData.map(m=>{
            var warehouseName = m.warehouseName;
            var warehouseID = m.warehouseID;
            element = '<option value='+warehouseID+'>'+warehouseName+'</option>'
            $('#destination').append(element);
            
        })
    }
    else{
        $("#destination").html('<option value="0">None Selected </option>');
        // $("#destination").html('<option  value="0">Select Destination</option>');
    }
}

populateBrands=()=>{
    $('#brands').empty();
    // $('#select2-chosen-4').html("All Brands")
    var incomeHead = $('#incomeHead').val();

    db.all(`SELECT DISTINCT brandID,brandName FROM products WHERE incomeHead LIKE "${incomeHead}"`,function(err,row){
        if(err){
            console.log(err);
          isError(fetchingErrMsg,reRenderLocation)
        }                
        else{
            brandsData = row;
            if(brandsData){
                // $("#brands").html('<option value="0">All Brands</option>');
                brandsData.map(m=>{
                    brandNameData = m.brandName;
                    brandIdData = m.brandID;
                    element = '<option value='+brandIdData+'>'+brandNameData+'</option>'
                    $('#brands').append(element);
                })
            }
            else{
                // $("#brands").html('<option value="0">All Brands</option>');
            }
            initiateMultiSelect()
        }
    })
}

getStockLevel=async(filterType)=>{
    sourceValue = $('#source').val();
    var brandValue = $('#brands').val();
    var incomeHeadValue = $('#incomeHead').val()   
    console.log(sourceValue,'sourceValue',brandValue,incomeHeadValue)
    filterPacksQuery = `HAVING SUM(A.inventory) > 0`

    // if(filterType=='normLevelPacks'){
    //     filterPacksQuery = `HAVING B.lowStockAlertQuantity > 0 AND SUM(A.inventory) > 0`
    // }
    // else  if(filterType=='allPacks'){
    //     filterPacksQuery = `HAVING SUM(A.inventory) > 0`
    // }

    if(sourceValue=='0'){
        var message ='Please select Source !'
        isError(message)
        return false
    }

    if(sourceValue != storeID){
        var storeType = (sourceData.find(m=>m.warehouseID == sourceValue)).warehouseType
        sourceType = 'WAREHOUSE'

    }
    else if(sourceValue == storeID){
        sourceType = 'STORE'
    }

    normPacks = $('#switchOption1').val() == '1' ? true : false

    if(sourceValue != selectedSourceValue){
        getFilteredStock(normPacks,incomeHeadValue,brandValue)
    }
    else{
        
            var filterQuery = ` WHERE A.sbomDesc != 'LSBOM-C'`
            // if(incomeHeadValue == '0' && (brandValue =="0"|| brandValue.length =="0")){
            //     filterQuery = ` WHERE A.sbomDesc != 'LSBOM-C'`
            // }
            // else if(incomeHeadValue != '0' && (brandValue =="0"|| brandValue.length =="0")){
            //     filterQuery = `WHERE A.sbomDesc != 'LSBOM-C' AND B.incomeHead Like '%${incomeHeadValue}%'`
                
            // }
            // else if(incomeHeadValue != '0' && (brandValue !="0"|| brandValue.length)) {
            //     filterQuery = `WHERE  A.sbomDesc != 'LSBOM-C'  AND B.brandID IN (${brandValue})  AND B.incomeHead LIKE  '%${incomeHeadValue}%'`
            // }
        
            switch(storeType){
                case 'CENTRAL' : 
                sourceTableName = 'cw_productBatchVariant'
                break;
        
                case 'DAMAGED' : 
                sourceTableName = 'dw_productBatchVariant'
                break;
        
                case 'EXPIRED' : 
                sourceTableName = 'ew_productBatchVariant'
                break;
        
                default : 
                sourceTableName = 'batchProductVariants'
            }
        
            var query = `SELECT DISTINCT A.productID,B.unitsPerCase,B.productName,B.incomeHead ,B.brandID,B.lowStockAlertQuantity,SUM(A.inventory) AS closingStock,B.MRP,C.turPerUnit FROM ${sourceTableName} AS A INNER JOIN products AS B ON A.productID = B.productID INNER JOIN storeRegion as C ON  A.serialNumber = C.sku ${filterQuery} GROUP BY A.productID ${filterPacksQuery}`
        
            console.log(query,'query')
        
            //filteredCartBatches = discountedSBatchData.filter(o2 => eligibleBatchesID.some(o1 => o1== o2.batchVarRefID));
        
            loader(1)
            stockList = await new Promise((resolve,reject)=>{
                db.all(query,function(err,rows){
                    if(err){
                        console.log(err)
                        isError(fetchingErrMsg,reRenderLocation)
                    }
                    else{
                        loader(0)
                        resolve(rows);
                    }
                })
            })
        
            stockList.map(m=>{
                m['unit'] = 0;
                m['productValue'] = 0.00;
             })
             console.log(stockList,'stockList')
            //  $('#stockTable').bootstrapTable('destroy')
            //  $('#stockTable').bootstrapTable(
            //      {
            //          data:stockList,
            //          search:true,
            //          reinit: true,
            //          trimOnSearch:false,
            //          pagination:true
            //      }
            //  );
            //  loader(0)
            //  $('#addCartBtn').css("display",'flex')    
            //  $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
            //  $('.customInputSearchDiv').addClass('flex-row margin-20')
            //  $('#switchFilters').css('display','flex')   
            selectedProductData=[];
            selectedProductBatchData = [];
            cartData = [];
            $('#stockAdded').text("") 
            await getFilteredStock(normPacks,incomeHeadValue,brandValue) 

    }
    selectedSourceValue = 0;
}


getFilteredStock=(normPacks,incomeHeadValue,brandValue)=>{
    console.log(normPacks,incomeHeadValue,brandValue)
    loader(1)
    filteredStockList = []
    if(incomeHeadValue == '0' && (brandValue =="0" || brandValue.length == '0')){
        filteredStockList = stockList
    }
    if(incomeHeadValue != '0' && (brandValue =="0" || brandValue.length == '0')){
        filteredStockList = stockList.filter(b=>b.incomeHead==incomeHeadValue)
    }
    else if(incomeHeadValue != '0' && (brandValue !="0" || brandValue.length)){
        filteredStockList = stockList.filter(b=>brandValue.indexOf(`${b.brandID}`) != -1)
    }
    if(normPacks){
        filteredStockList= filteredStockList.filter(a=>a.lowStockAlertQuantity>0)
    }
    else{
        filteredStockList = filteredStockList
    }
    
    filteredStockList.sort((a,b)=>(b.unit) - (a.unit))
    console.log(filteredStockList,'filteredStockList')
    $('#stockTable').bootstrapTable('destroy')
    $('#stockTable').bootstrapTable(
        {
            data:filteredStockList,
            search:true,
            reinit: true,
            trimOnSearch:false,
            pagination:true
        }
    );
    loader(0)
    $('#addCartBtn').css("display",'flex')    
    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    $('.customInputSearchDiv').addClass('flex-row margin-20')
    $('#switchFilters').css('display','flex')
}

normLevelPacks=()=>{
    // var brandValue = $('#brands').val();
    // var incomeHeadValue = $('#incomeHead').val()
    var v = $('#switchOption1').val()
    if(v=='1'){
        $('#switchOption1').val('0')
        $('#switchOption1').attr('unchecked',true).attr('checked',false)
        getStockLevel()
        // getFilteredStock(false,incomeHeadValue,brandValue)
        // normLevelApplied = false
    }
    else{
        $('#switchOption1').val('1')
        $('#switchOption1').attr('unchecked',false).attr('checked',true)
        getStockLevel()
        // getFilteredStock(true,incomeHeadValue,brandValue)
        // normLevelApplied = true
    }
}

applyCLD=()=>{
    var v3 = $('#switchOption2').val()
    if(v3=='1'){
        upcFactor = false
        $('#switchOption2').val('0')
        $('#switchOption2').attr('unchecked',true).attr('checked',false)
    }
    else{
        upcFactor = true
        $('#switchOption2').val('1')
        $('#switchOption2').attr('unchecked',false).attr('checked',true)
    }
}

triggerPrintPdf = async(acton) => {
    sourceValue = $('#source').val();


    var today = new Date();
    year = today.getFullYear();
    month = (today.getMonth() + 1),
    day = today.getDate(),
    hour = today.getHours();
    minut = today.getMinutes();
    seconds= today.getSeconds()

    if (month.length < 2 || month<10) 
    month = '0' + month;
    if (day.length < 2 || day<10) 
    day = '0' + day;
    if (hour.length < 2 || hour<10) 
    hour = '0' + hour;
    if (minut.length < 2 || minut<10) 
    minut = '0' + minut;
    if (seconds.length < 2 || seconds<10) 
    seconds = '0' + seconds;

    var dateLocal = year+month+day;
    var timeLocal = dateLocal+hour+minut+seconds;
    var currentTimestamp =timeLocal
    var baseLevelList = []
    if(sourceValue != storeID){
        var storeType = (sourceData.find(m=>m.warehouseID == sourceValue)).warehouseType
        sourceType = 'WAREHOUSE'

    }
    else if(sourceValue == storeID){
        sourceType = 'STORE'
    }
    
    if(storeType=='CENTRAL'){
        sourceTableName = 'cw_productBatchVariant'
    }
    else if(storeType=='DAMAGED'){
        sourceTableName = 'dw_productBatchVariant'
    }
    else if(storeType=='EXPIRED'){
        sourceTableName = 'ew_productBatchVariant'
    }
    else{
        sourceTableName = 'batchProductVariants'
    }

    // var filterQuery = ` WHERE A.sbomDesc != 'LSBOM-C'`

    var query = `SELECT DISTINCT A.productID,A.batchVariantName,A.serialNumber AS sku,B.productName,SUM(A.inventory) AS closingStock,B.MRP,C.turPerUnit FROM ${sourceTableName} AS A INNER JOIN products AS B ON A.productID = B.productID INNER JOIN storeRegion as C ON  A.serialNumber = C.sku  GROUP BY A.productID ${filterPacksQuery}`
    //var query = `SELECT DISTINCT A.productID,A.batchVariantName,SUM(A.inventory) AS closingStock, A.serialNumber AS sku FROM ${sourceTableName} AS A ${filterQuery} GROUP BY A.productID HAVING SUM(A.inventory) > 0`
    console.log(query,'query')
    baseLevelList = await new Promise((resolve,reject)=>{
        db.all(query,function(err,rows){
            if(err){
                console.log(err)
            }
            else{
                resolve(rows);
            }
        })
    })
    
    console.log(baseLevelList,'baseLevelList')

    if(baseLevelList.length == 0){
        isError('No item found!')
        return false
    }
    
    baseLevelList.sort((a,b)=>(b.closingStock) -(a.closingStock))

    baseLevelList.map((m,i)=>{
        m['SNo'] = ++i;
    })

    var table1columns = [
        {title: "#", dataKey: "SNo"},
        {title: "Item Description", dataKey: "productName"}, 
        {title: "SKU", dataKey: "sku"},
        {title: "MRP", dataKey: "MRP"},
        {title: "TUR", dataKey: "turPerUnit"},
        {title: "Closing Stock", dataKey: "closingStock"},
    ];

    var columnsObj ={
        table1columns,
    }

    var tableData = baseLevelList

    var docInfo = {
        'action':acton,
        'storeInfoShown': true,
        'taxShown': false,
        'title' : `${sourceName} Closing Stock List`,
        'fileName' : `closingStockList_${currentTimestamp}.pdf`
    }
    
    printPdf(columnsObj,tableData,docInfo) 

    // console.log(status,'status')

    // if(status){
    //     $('#successTag').text('Download')
    //     $('#successTagl').text('downloaded')
    //     $('.fileName').text(`closingStockList.pdf`)
    //     $('#successModal').modal('show');
    // }


};
closeSuccModal=()=>{
    $(`#successModal`).modal('hide');
}

renderSelectStockBtn=(value,row)=>{
    if(row.unit){
        return `<button type = "button" id="stockBtn${row.productID}" onclick="showBatches(${row.productID})" class ="btnWhite">Select Stock</button>`
    }
    else{
        return `<button type = "button" id="stockBtn${row.productID}" onclick="showBatches(${row.productID})" class ="btnWhite inactiveDiv">Select Stock</button>`
    }
}


renderUnit=(value,row)=>{
    if(row.unit){
        return `<div  class=" flex-row activeDiv" style="justify-content:flex-end"  id="prodDiv${row.productID}">
        <button class='btn btn-primary btn-xs quant-chng-btn' onclick="decreaseQuant(${row.productID},'prod')"  id="prod${row.productID}dec" >-</button>
        <input class='quantityInput' type="number" id="prod${row.productID}input" value="${row.unit}" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${row.productID},'prod')" onclick="changeQuantity(${row.productID},'prod')"></input>
        <button class='btn btn-primary btn-xs quant-chng-btn'  onclick="increaseQuant(${row.productID},'prod')" id="prod${row.productID}inc">+</button>
        </div>`;
    }
    else{
        return `<div   class=" flex-row inactiveDiv" style="justify-content:flex-end" id="prodDiv${row.productID}">
            <button class='btn btn-primary btn-xs quant-chng-btn' onclick="decreaseQuant(${row.productID},'prod')"  id="prod${row.productID}dec" >-</button>
            <input class='quantityInput' type="number" id="prod${row.productID}input" value="${row.unit}" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${row.productID},'prod')" onclick="changeQuantity(${row.productID},'prod')"></input>
            <button class='btn btn-primary btn-xs quant-chng-btn' onclick="increaseQuant(${row.productID},'prod')" id="prod${row.productID}inc">+</button>
        </div>`;
    }
}
renderPrice=(value,row)=>{
    return `<div  id="priceDiv${row.productID}">${row.productValue}</div>`;
}

renderProdCheck=(value,row)=>{
    var id=row.productID;
    if(row.unit){
        checkDisabledElement('prod','checked',id,row.unit,row)
        return `<input type="checkbox" checked id="checkProd${row.productID}" data-string="${row}" onclick="prodSelect(${row.productID},${row.closingStock},this)" name="checkID">`;
    }
    else{
        checkDisabledElement('prod','unchecked',id,0)
        return `<input type="checkbox" id="checkProd${row.productID}"  data="${row}" onclick="prodSelect(${row.productID},${row.closingStock},this)" name="checkID">`;
    }
}


prodSelect=(id,closingStock,event)=>{
    if(closingStock<=0){
        $(`#checkProd${id}`).prop('checked', false);
        isError('You can not select zero closing stock pack!')
        return false
    }
    var checkStatus = event.checked
    if(checkStatus){
        row = stockList.find(m=>m.productID== id)
        checkDisabledElement('prod','checked',id,0,row)
    
    }
    else{
        checkDisabledElement('prod','unchecked',id,0)
    }
}
checkDisabledElement=(type,status,id,unit,row)=>{
    var inputID = '#'+type+id+'input';
    if(type == "prod"){
        if(status == "checked"){
            $('#'+id+'dec').attr("disabled",true);
            $('#'+id+'inc').attr("disabled",false);
            $("#prodDiv"+id).addClass("activeDiv");
            $("#prodDiv"+id).removeClass("inactiveDiv");
            $("#stockBtn"+id).addClass("activeDiv");
            $("#stockBtn"+id).removeClass("inactiveDiv");
            // $('#stockBtn'+id).attr("disabled",false);
            if(unit<=0){
                $('#'+type+id+'dec').attr("disabled",true);
                $('#'+type+id+'inc').attr("disabled",false);
            }

            $(inputID).val(unit);
            if(row){
               var checkArr =  selectedProductData.filter(m=>m.productID == row.productID )
               if(!checkArr.length){
                   selectedProductData.push(row)
                   selectedProductData.map(m=> {
                    if(m.productID == id){
                        m.currentInventory = m.closingStock - unit
                    }
                })
                   productBatchData(id,unit,type)
               }
            }
        }
        else if(status == "unchecked"){
            $("#prodDiv"+id).removeClass("activeDiv");
            $("#prodDiv"+id).addClass("inactiveDiv");
            $("#stockBtn"+id).addClass("inactiveDiv");
            $("#stockBtn"+id).removeClass("activeDiv");
            $(inputID).val(0);
            handleCartChange(selectedProductBatchData , id,unit,type,'remove')
        }
    }
    else{
        if(status == "checked"){
            $("#batchDiv"+id).addClass("activeDiv");
            $("#batchDiv"+id).removeClass("inactiveDiv");
            if(unit<=0){
                $('#'+type+id+'dec').attr("disabled",true);
                $('#'+type+id+'inc').attr("disabled",false);
            }
            $(inputID).val(unit);
            if(cSelectedProductBatchData.length){
                var batchObj = cSelectedProductBatchData.find(m=>m.batchVariantID ==id)
                batchObj['currentInventory'] =  batchObj.inventory - unit;
                batchObj['unit'] = unit;
                batchObj['batchPrice'] = parseFloat((batchObj.turPerUnit*unit).toFixed(2))
            }

            $('#'+id+'dec').attr("disabled", true);
            $('#'+id+'inc').attr("disabled", false);
        }
        else if(status == "unchecked"){
            $("#batchDiv"+id).removeClass("activeDiv");
            $("#batchDiv"+id).addClass("inactiveDiv");
            if(cSelectedProductBatchData.length){
                var batchObj = cSelectedProductBatchData.find(m=>m.batchVariantID ==id)
                batchObj['currentInventory'] =  batchObj.inventory
                batchObj['unit'] = 0
                batchObj['batchPrice'] = 0
            }

            $(inputID).val(0);
        }
    }
}

productBatchData=(productID,unit,type)=>{
    var batchQuery = `SELECT ${sourceTableName}.*,storeRegion.turPerUnit, storeRegion.mrpPerUnit AS MRP , storeRegion.cpLinkage,storeRegion.parentSkuQty,storeRegion.childSkuQty FROM ${sourceTableName} INNER JOIN storeRegion ON ${sourceTableName}.batchVarRefID = storeRegion.batchVariantID WHERE ${sourceTableName}.inventory > 0 AND ${sourceTableName}.productID = ${productID} AND ${sourceTableName}.sbomDesc != 'LSBOM-C'`
    console.log(batchQuery,'batchQuery')
    db.all(batchQuery,function(err,rows){
        if(err){
            console.log(err);
          isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            console.log(rows,'rows',productID)
            selectedProductBatchData.push(...rows)
            selectedProductBatchData.sort((a,b)=>new Date(a.manufacturingDate) - new Date(b.manufacturingDate))
            console.log(selectedProductBatchData,productID,unit,type)
            handleCartChange(selectedProductBatchData,productID,unit,type);
        }
    })
}

showBatches=(productID)=>{
    if(selectedProductBatchData.length){
        filteredProductBatch = selectedProductBatchData.filter(m=>m.productID == productID)
        $('#batchVariantListTable').bootstrapTable('destroy');
        $('#batchVariantListTable').bootstrapTable({
            data:filteredProductBatch,
            search:false,
            pagination:false,
            trimOnSearch:false,
            reinit: true,
        });
        $('#roleTitle1').text(filteredProductBatch[0].productName)
        $("#myModal").modal('show');
        $("#prodId").val(productID);
        cSelectedProductBatchData = JSON.parse(JSON.stringify(selectedProductBatchData));
    }
}

renderBatchUnit=(value,row)=>{
    if(row.unit){
        return `<div class='flex-row activeDiv' id="batchDiv${row.batchVariantID}"  style="justify-content:flex-start">
        <button  class='btn btn-primary btn-xs quant-chng-btn' id="batch${row.batchVariantID}dec" onclick="decreaseQuant(${row.batchVariantID},'batch')"> - </button>
        <input value="${row.unit}" min="0" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${row.batchVariantID},'batch')" onclick="changeQuantity(${row.batchVariantID},'batch')"   type='number' class='quantityInput' id="batch${row.batchVariantID}input" name='inventory' />
        <button class='btn btn-primary btn-xs quant-chng-btn'  id="batch${row.batchVariantID}inc"  onclick="increaseQuant(${row.batchVariantID},'batch')"> + </button>
        </div>`
    }else{
        return `<div class='flex-row inactiveDiv' id="batchDiv${row.batchVariantID}"  style="justify-content:flex-start">
        <button  class='btn btn-primary btn-xs quant-chng-btn' id="batch${row.batchVariantID}dec" onclick="decreaseQuant(${row.batchVariantID},'batch')"> - </button>
        <input value="${row.unit}" min="0" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${row.batchVariantID},'batch')" onclick="changeQuantity(${row.batchVariantID},'batch')"   type='number' class='quantityInput' id="batch${row.batchVariantID}input" name='inventory' />
        <button class='btn btn-primary btn-xs quant-chng-btn'  id="batch${row.batchVariantID}inc"  onclick="increaseQuant(${row.batchVariantID},'batch')"> + </button>
        </div>`
    }
}

renderBatchCheck=(value,row)=>{	
    var id=row.batchVariantID;
    if(row.unit){
        checkDisabledElement('batch','checked',id,row.unit)
        return `<input type="checkbox" checked id="checkBatch${row.batchVariantID}" onclick="batchVarientSelect(${row.batchVariantID},this)" name="checkID" style="margin-right:8px">`+ row.manufacturingDate;
    }
    else{
        checkDisabledElement('batch','unchecked',id,0)
        return `<input type="checkbox" id="checkBatch${row.batchVariantID}" onclick="batchVarientSelect(${row.batchVariantID},this)" name="checkID" style="margin-right:8px">`+ row.manufacturingDate;
    }
}

batchVarientSelect=(id,event)=>{
    var checkStatus = event.checked
    if(checkStatus){
        checkDisabledElement('batch','checked',id,0)
    }
    else{
        checkDisabledElement('batch','unchecked',id,0)
    }
}

changeQuantity=(rowID,type)=>{
    var obj={};
    var productID;

    inBtnID = '#'+type+rowID+'inc';
    deBtnID = '#'+type+rowID+'dec';
    inputID = '#'+type+rowID+'input';

    if(type=='prod'){
        productID=rowID;
        selectedProductData.map(m=>{
            if(m.productID ==rowID){
                maxInventory = m.closingStock;
                obj = m;
            }
        })
    }
    else if(type== "batch"){
       var batchObj = cSelectedProductBatchData.find(m=>m.batchVariantID ==rowID)
       maxInventory =  batchObj.inventory
       obj = batchObj;
       productID=batchObj.productID;
    }
    //inputID = '#'+rowID;
    var currentValue = $(inputID).val(); 
    if(currentValue==0){
        $(inputID).val('');
    }   
        if(currentValue>maxInventory){
            $(inputID).val(maxInventory);
            currentValue=maxInventory;
            obj['unit']=maxInventory;
            obj['currentInventory']=0;
            if(type=='batch'){
                obj['batchPrice'] = parseFloat((obj.turPerUnit*maxInventory).toFixed(2));									
            }
            $(inBtnID).attr("disabled", true);
            if(type == "prod"){
                handleCartChange(selectedProductBatchData,productID,currentValue,type);
            }
        }
        else if(currentValue<0 && currentValue!=""){
            $(inputID).val(0);
            currentValue=0;
            obj['unit']=0;
            obj['currentInventory']=maxInventory;
            if(type=='batch'){
                obj['batchPrice'] = parseFloat((obj.turPerUnit).toFixed(2))	;																	
            }
            $(deBtnID).attr("disabled", true);
            if(type == "prod"){
                handleCartChange(selectedProductBatchData,productID,currentValue,type);
            }
        }
        else{
            obj['unit']=currentValue;
            obj['currentInventory']=maxInventory - currentValue;
            if(type=='batch'){
                obj['batchPrice'] = parseFloat((obj.turPerUnit*currentValue).toFixed(2))																		
            }
            $(deBtnID).attr("disabled", false);
            $(inBtnID).attr("disabled", false);
            if(currentValue==maxInventory){
                $(inBtnID).attr("disabled", true);
            }
            if(currentValue == 0){
                $(deBtnID).attr("disabled",true);									
            } 
            if(type == "prod"){
                handleCartChange(selectedProductBatchData,productID,currentValue,type);
            }
        }

        $(inputID).blur(function(){
            var currentValue = $(inputID).val();
            var reg = /^\d+$/;
            var isValidate = reg.test(currentValue)
            if(!isValidate){
                $(inputID).val(0);
                currentValue=0;
                obj['currentInventory']=maxInventory;
                obj['unit']=0;
                if(type=='batch'){
                    obj['batchPrice'] = parseFloat((obj.turPerUnit).toFixed(2))										
                }
                $(deBtnID).attr("disabled", true);
                if(type == "prod"){
                    handleCartChange(selectedProductBatchData,productID,currentValue,type);
                } 
            }
            // if(!currentValue){
            //     $(inputID).val(0);
            //     currentValue=0;
            //     obj['currentInventory']=maxInventory;
            //     obj['unit']=0;
            //     if(type=='batch'){
            //         obj['batchPrice'] = parseFloat((obj.turPerUnit).toFixed(2))										
            //     }
            //     $(deBtnID).attr("disabled", true);
            //     if(type == "prod"){
            //         handleCartChange(selectedProductBatchData,productID,currentValue,type);
            //     }  
            // }
        });
}

increaseQuant=(rowID,type)=>{
    var productID;
    var obj={};
    inBtnID = '#'+type+rowID+'inc';
    deBtnID = '#'+type+rowID+'dec';
    inputID = '#'+type+rowID+'input';

    if(type=='prod'){
        productID=rowID
        selectedProductData.map(m=>{
            if(m.productID ==rowID){
                maxInventory = m.closingStock;
                UPC = m.unitsPerCase
                obj = m;
            }
        })
    }
    else if(type=='batch'){
        var batchObj = cSelectedProductBatchData.find(m=>m.batchVariantID ==rowID)
        maxInventory =  batchObj.inventory
        obj = batchObj;
        productID=batchObj.productID;
    }
    //inputID = '#'+rowID;
    $(deBtnID).attr("disabled",false);
    var currentValue = $(inputID).val();
    currentValue = parseInt(currentValue);

    if(currentValue<maxInventory){
        if(type=='prod' && upcFactor){
            currentValue = parseInt(currentValue) + parseInt(UPC) ;
            if(currentValue>=maxInventory){
                currentValue = maxInventory
            }
        }
        else{
            currentValue++; 
        }

        obj['unit']=currentValue;	
        obj['currentInventory']=maxInventory - currentValue;
        if(type!='prod'){
            obj['batchPrice'] = parseFloat((obj.turPerUnit*currentValue).toFixed(3))								
        }	
        $(inputID).val(currentValue);
        if(currentValue==maxInventory){
        $(inBtnID).attr("disabled",true);
        }     
        if(type != "batch"){
            handleCartChange(selectedProductBatchData,productID,currentValue,type);
            //assignBatchToCart(productID,currentValue,type);
        }
    }
}

decreaseQuant=(rowID,type)=>{
    var productID;
    var obj={};
    inBtnID = '#'+type+rowID+'inc';
    deBtnID = '#'+type+rowID+'dec';
    inputID = '#'+type+rowID+'input';

    if(type=='prod'){
        productID=rowID;
        selectedProductData.map(m=>{
        if(m.productID ==rowID){
            maxInventory = m.closingStock;
            UPC = m.unitsPerCase
            obj = m;
        }
    })
    }
    else if(type=='batch'){
        var batchObj = cSelectedProductBatchData.find(m=>m.batchVariantID ==rowID)
        maxInventory =  batchObj.inventory
        obj = batchObj;
        productID=batchObj.productID;
    }
    //inputID = '#'+rowID;
    $(inBtnID).attr("disabled",false);
    var currentValue = $(inputID).val();
    // currentValue = parseInt(currentValue);
    if(currentValue>0){
        if(type=='prod' && upcFactor){
            currentValue = parseInt(currentValue) - parseInt(UPC) ;
            if(currentValue<=0){
                currentValue = 0
            }
        }
        else{
            currentValue-- 
        }
        obj['unit']=currentValue;
        obj['currentInventory']=maxInventory - currentValue;
        if(type!='prod'){
            obj['batchPrice'] = parseFloat((obj.turPerUnit*currentValue).toFixed(3))										
        }									
        $(inputID).val(currentValue);
        if(currentValue<=0){
        $(deBtnID).attr("disabled",true);
        }   
        if(type != "batch"){
            handleCartChange(selectedProductBatchData,productID,currentValue,type);
            //assignBatchToCart(productID,currentValue,type);
        }
    }
}

saveBatchModal=()=>{
    var prodID = $('#prodId').val();
    $('#myModal').modal('hide');

    //assignBatchToCart(cSelectedProductBatchData,prodID,'batch')
    handleCartChange(cSelectedProductBatchData,prodID,'','batch');
    // reRenderTable(prodID,cartData,selectedProductData)
    filteredProductBatch=[];
    cSelectedProductBatchData = [];
} 

closeBatchModal=()=>{
    // var sProductBatchData = selectedProductBatchData
    // var prodID = $('#prodId').val()
    // assignBatchToCart(sProductBatchData,prodID);
    $('#myModal').modal('hide');
    filteredProductBatch = [];
    cSelectedProductBatchData = [];
} 

$("#myModal").on("hidden.bs.modal", function () {
    filteredProductBatch = [];
    cSelectedProductBatchData = [];
});

handleCartChange = (selectedProductBatchData,productID,currentValue,type,action)=>{
   
    var sProductBatchData = selectedProductBatchData
    if(type=='prod'){
        var filteredCartData = sProductBatchData.filter(m=>(m.productID==productID))
        var maxUnitLimit = currentValue;
        filteredCartData.map(m=>{
            if(maxUnitLimit>m.inventory){
                m.unit=m.inventory;
                m.currentInventory=0;
                m.batchPrice = parseFloat((m.turPerUnit*m.inventory).toFixed(2))	
                maxUnitLimit=maxUnitLimit-m.inventory;
            }
            else{
                m.unit=maxUnitLimit;
                m.currentInventory=m.inventory - maxUnitLimit;
                m.batchPrice = parseFloat((m.turPerUnit*maxUnitLimit).toFixed(2))
                maxUnitLimit=0
            }
            return m
        })
    }
    handleChildProductBatchToCart(sProductBatchData,productID,type,action)
    //assignBatchToCart(sProductBatchData,productID,type,action)    
}

handleChildProductBatchToCart = (fifoSBatchData,productID,type,action)=>{
    let sBomfifoSBatchData = fifoSBatchData.filter(m=>(m.productID==productID))
    sBomfifoSBatchData.map(async m=>{
        let sBomCart=[];
        if(m.sbomDesc == "LSBOM-P"){
            fifoSBatchData =  fifoSBatchData.filter(n=>n.serialNumber!=m.cpLinkage)
            var childBatches = []
            var i = 0;
            var maxUnitLimit = 0
            var query;
            if(m.unit>=parseInt(m.parentSkuQty)){
                i = Math.floor(m.unit/parseInt(m.parentSkuQty));
                query = `SELECT ${sourceTableName}.* , storeRegion.turPerUnit,  storeRegion.cpLinkage,storeRegion.parentSkuQty,storeRegion.childSkuQty FROM ${sourceTableName} INNER JOIN storeRegion ON ${sourceTableName}.serialNumber = storeRegion.sku  WHERE serialNumber = '${m.cpLinkage}' AND  ${sourceTableName}.inventory > 0  order by manufacturingDate asc `
                childBatches = await fetchChildBatches(query)
                
                maxUnitLimit = i*parseInt(m.childSkuQty);

                childBatches.map(n=>{
                    if(maxUnitLimit>n.inventory){
                        n.unit=n.inventory;
                        n.currentInventory=0;
                        n.batchPrice = parseFloat((n.turPerUnit*n.inventory).toFixed(3))	
                        maxUnitLimit=maxUnitLimit-n.inventory;
                    }
                    else{
                        n.unit=maxUnitLimit;
                        n.currentInventory=n.inventory - maxUnitLimit;
                        n.batchPrice = parseFloat((n.turPerUnit*maxUnitLimit).toFixed(3))
                        maxUnitLimit=0
                    }
                    sBomCart = sBomCart.filter(l=>l.batchVariantID!=n.batchVariantID)
                    sBomCart.push(n)
                })    
            }
        }
        fifoSBatchData = [...fifoSBatchData,...sBomCart]
        assignBatchToCart(fifoSBatchData,productID,type,action)    
    })
}

fetchChildBatches=async(query)=>{
    childBatches = await new Promise((resolve,reject)=>{
        db.all(query,function(error,data){
            if(error){
                console.log(error)
            }
            else{
                resolve(data);
            }
        })
    })
    return childBatches
}



assignBatchToCart=(sProductBatchData,productID,type,action)=>{

    var sProductData = selectedProductData
    selectedProductBatchData = sProductBatchData
   if(action=='remove'){
        sProductData.map(m=>{
            if(m.productID==productID){
                m.unit = 0;
                m.productValue = 0
            }
            return m
        })
       sProductData = sProductData.filter(m=>m.productID!=productID)
       selectedProductBatchData = sProductBatchData.filter(m=>m.productID!=productID)
   }
    
   cartData = selectedProductBatchData.filter(m=>(m.unit>0));

   reRenderTable(productID,cartData,sProductData,type)

}



reRenderTable=(productID,cartData,sProductData,type)=>{
    // var sProductData = selectedProductData
    if(sProductData.length){
        $('#stockAdded').text('('+sProductData.length+')')
    }
    else{
        $('#stockAdded').text("")  
    }
    totalProductPrice=0;
    totalProductUnit=0;
    totalUnits = 0;
    totalPrice = 0;

    cartData.map(m=>{
        // $('#reviewBatchPriceDiv'+m.batchVariantID).html(m.productValue)
        if(m.productID==productID){
            totalProductPrice+=parseFloat(m.batchPrice);
            totalProductUnit+=parseInt(m.unit);
        }			
    })

    console.log(totalProductPrice,'totalProductPrice1')

    totalProductPrice = parseFloat(totalProductPrice.toFixed(2))

    sProductData.map(m=>{
        if(m.productID==productID){
            m['productValue'] = totalProductPrice;
            m['unit'] = totalProductUnit;
        }
        totalPrice += parseFloat(m.productValue);
        return m;
    })
    totalUnits = sProductData.length;

    if(type == 'batch'){
        var productForRenderUnit = selectedProductData.find(m=>m.productID == productID)
        var prodID =  '#prod'+productID
        var inputID = prodID+'input';
        $(inputID).val(productForRenderUnit.unit)
        if(productForRenderUnit.unit<=0){
            $(prodID+'dec').attr('disabled',true)
            $(prodID+'inc').attr('disabled',false)
        }
        else if(productForRenderUnit.unit>=productForRenderUnit.closingStock){
            $(prodID+'dec').attr('disabled',false)
            $(prodID+'inc').attr('disabled',true)
        }
        else{
            $(prodID+'dec').attr('disabled',false)
            $(prodID+'inc').attr('disabled',false)
        }
    }

    $('#priceDiv'+productID).text(totalProductPrice)
    $('#reviewPriceDiv'+productID).html(totalProductPrice)
    $('#reviewUnitDiv'+productID).html(totalProductUnit)
    $('#totalItems').html(totalUnits)
    $('#totalPrice').html(totalPrice.toFixed(2))
    selectedProductData = sProductData
    console.log(selectedProductData,'selectedProductData',cartData,'cartData',selectedProductBatchData,'selectedProductBatchData',productID)
}

addStock=()=>{

    destinationValue = $('#destination').val();
    console.log(destination,'destination')

    if(destinationValue == '0'){
        var message ='Please select Destination!'
        isError(message)
        return false
    }

    if(destinationValue != storeID){
        var dStoreType = (availDestinationData.find(m=>m.warehouseID == destinationValue)).warehouseType
        destinationType = 'WAREHOUSE'
    }
    else if(destinationValue == storeID){
        destinationType = 'STORE'
    }

    switch(dStoreType){
        case 'CENTRAL' : 
        destinationTableName = 'cw_productBatchVariant'
        break;

        case 'DAMAGED' : 
        destinationTableName = 'dw_productBatchVariant'
        break;

        case 'EXPIRED' : 
        destinationTableName = 'ew_productBatchVariant'
        break;

        default : 
        destinationTableName = 'batchProductVariants'
    }

    if(selectedProductData.length){
        $('#stockLevel').css('display','none');

        $('#reviewStockLevel').css({'display':'flex', 'flex-direction': 'column'});
        $('#reviewTableFooter').css('display','flex');
        $('#reviewStockTable').bootstrapTable('destroy');
        $('#reviewStockTable').bootstrapTable(
            {data:selectedProductData,
            search:true,
            reinit: true,
            pagination:false,
            trimOnSearch:false,
        });
        $('.customInputSearchDiv').css('display','none');
        sourceName = $('#source option:selected').text();
        destinationName = $('#destination option:selected').text();
        $('#sourceName').text(sourceName);
        $('#destinationName').text(destinationName);
    }
    else{
        var message ='Please select stock!'
        isError(message)
        return false
    }

}

function rowAttributes(row,index){
    return {id:'row'+row.productID}
}

renderActionButton=(value,row)=>{
    return `<img onclick="deleteProduct(${row.productID})" src = "../../assets/img/trash-gray.png">`
}


function renderReviewPrice(value,row){
    return `<div  id="reviewPriceDiv${row.productID}">${row.productValue}</div>`;
}
function renderReviewUnit(value,row){
    return `<div  id="reviewUnitDiv${row.productID}">${row.unit}</div>`;
}

renderReviewSelectStockBtn=(value,row)=>{
    return `<button type = "button" id="stockBtn${row.productID}" onclick="showBatches(${row.productID})" class ="btnWhite">Select Stock</button>`
}

deleteProduct=(productID)=>{
    $('#row'+productID).remove()
    $('.rowBatch'+productID).remove();
    $('#stockBtn'+productID).attr("disabled", true);
    $("#prodDiv"+productID).removeClass("activeDiv");
    $("#prodDiv"+productID).addClass("inactiveDiv");
    $('#prod'+productID+'input').val(0);
    handleCartChange(selectedProductBatchData,productID,0,'','remove');
    if(selectedProductData.length == 0){
        var dialogOptions = {type: 'info', buttons: ['OK'], message: `Cart is empty!`}
        dialog.showMessageBox(dialogOptions, async i => {
            if(!i){
                edit()
            }
        })
    }
}

edit=()=>{
    getStockLevel()
    $('#stockLevel').css('display','block');
    $('#reviewStockLevel').css('display','none');

    // var aplliedStockList = []
    // if(normLevelApplied){
    //     aplliedStockList = filteredStockList
    // }
    // else{
    //     aplliedStockList = stockList
    // }

    // aplliedStockList.sort((a,b)=>(b.unit) - (a.unit))

    // $('#stockLevel').css('display','block');
    // $('#reviewStockLevel').css('display','none');
    // $('#stockTable').bootstrapTable('destroy');
    // $('#stockTable').bootstrapTable(
    //     {data:aplliedStockList,
    //     search:true,
    //     reinit: true,
    //     pagination:true,
    //     trimOnSearch:false,
    // });

    // $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    // $('.customInputSearchDiv').addClass('flex-row margin-20')
    // $("#stockTable").bootstrapTable("uncheckBy", { field: "unit", values: [0] })
    // $('#switchFilters').css('display','flex')    
}

//transfer - STOCK_TRANSFER


transfer=()=>{
    var today = new Date();
    year = today.getFullYear();
    month = (today.getMonth() + 1),
    day = today.getDate(),
    hour = today.getHours();
    minut = today.getMinutes();
    seconds= today.getSeconds()

    if (month.length < 2 || month<10) 
    month = '0' + month;
    if (day.length < 2 || day<10) 
    day = '0' + day;
    if (hour.length < 2 || hour<10) 
    hour = '0' + hour;
    if (minut.length < 2 || minut<10) 
    minut = '0' + minut;
    if (seconds.length < 2 || seconds<10) 
    seconds = '0' + seconds;

    var dateLocal = year+'-'+month+'-'+day;
    var timeLocal = dateLocal +" "+ hour + ":" + minut + ":" + seconds;
    //var timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
    var timezone="Asia/Kolkata";
    db.all('SELECT *  FROM vendors',(err,data)=>{
        if(err){
            console.log(err);
          isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(data.length){
                var vendorID = data[0].vendorID
                var stockTransferData = {
                    transactionID:null,
                    isSync:0,
                    isError:'',
                    errorMessage:'',
                    sourceID:sourceValue,
                    sourceType:sourceType,
                    destinationID:destinationValue,
                    destinationType:destinationType,

                    billNumber:'',
                    invoiceNumber:'',
                    orderID:'',
                    purchaseOrderID:'',
                    stockReference:'',

                    transactionProducts:cartData,
                    transactionIDForChild:'',
                    transactionIDForParent : '',

                    status:'APPROVED',
                    transactionType :'STOCK_TRANSFER',
                    userID:userID,
                    user:userID,
                    userName:userName,
                    vendorID:vendorID,
                    totalCost:totalPrice,

                    returnedItems:0,
                    returnedPrice:0,

                    totalItemNumber:totalUnits,
                    transactionTimeLocal:timeLocal,
                    transactionDate:dateLocal,
                    timezone:timezone,
                    remarks:'',
                    fulfillmentStatus:'FULFILLED'
                }
                db.run("INSERT INTO stockTransactionSummary VALUES ($ID, $transactionID, $isSync,$isError,$errorMessage, $sourceID, $sourceType,$destinationID, $destinationType,$billNumber,$transactionIDForChild,$transactionIDForParent,$status,$fulfillmentStatus,$transactionType, $userID,$userName,$totalCost,$totalItemNumber, $transactionTimeLocal,$transactionDate,$timezone ,$remarks, $isDraftMode,$json)",{                    
                    $ID:null,
                    $transactionID:null,
                    $isSync:0,
                    $isError:'',
                    $errorMessage:'',
                    $sourceID:sourceValue,
                    $sourceType:sourceType,
                    $destinationID:destinationValue,
                    $destinationType:destinationType,
                    $billNumber:'',
                    $transactionIDForChild:'',
                    $transactionIDForParent : '',
                    $status:'APPROVED',
                    $fulfillmentStatus : 'FULFILLED',
                    $transactionType :'STOCK_TRANSFER',
                    $userID:userID,
                    $userName:userName,
                    $totalCost:totalPrice,
                    $totalItemNumber:totalUnits,
                    $transactionTimeLocal:timeLocal,
                    $transactionDate:dateLocal,
                    $timezone:timezone,
                    $remarks:'',
                    $isDraftMode : 0,
                    $json: JSON.stringify(stockTransferData),
                },(err,data)=>{
                    if(err){
                        console.log(err);
                        isError(placingErrMsg,reRenderLocation)
                    }else{
                        cartData.map(m=>{
                            db.run(`UPDATE ${sourceTableName} SET inventory = inventory - ${parseFloat(m.unit)}, inventoryCost = inventoryCost - ${parseFloat (m.batchPrice)}  WHERE batchVariantID  = '${m.batchVariantID}'`,function(err){
                                if(err){
                                console.log(err);
                                isError(placingErrMsg,reRenderLocation)
                                }
                            })
                            db.get(`SELECT batchVariantID FROM ${destinationTableName} WHERE batchVariantID  = '${m.batchVariantID}'`,(err,data)=>{
                                console.log(data,'data')
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    if(data && data.batchVariantID){
                                        db.run(`UPDATE ${destinationTableName} SET inventory = inventory + ${parseFloat(m.unit)}, inventoryCost = inventoryCost +${parseFloat (m.batchPrice)}  WHERE batchVariantID  = '${m.batchVariantID}'`,function(err){
                                            if(err){
                                                console.log(err);
                                                isError(placingErrMsg,reRenderLocation)
                                            }
                                        })
                                    }
                                    else{
                                        db.run(`INSERT INTO ${destinationTableName} (batchVariantID, batchVarRefID, batchVariantName, productID, variantID, productName, variantName, barcode, serialNumber, remarks, manufacturingDate, expiryDate, inventory, inventoryCost, sbomFlag, sbomDesc, isActive) VALUES(${m.batchVariantID}, ${m.batchVarRefID}, '${m.batchVariantName}', ${m.productID}, ${m.variantID}, '${m.productName}', '${m.variantName}', '${m.barcode}', '${m.serialNumber}', '${m.remarks}', ${m.manufacturingDate}, ${m.expiryDate}, 'inventory' + ${m.unit}, 'inventoryCost' + ${m.batchPrice}, ${m.sbomFlag}, '${m.sbomDesc}', ${m.isActive})`,(err,data)=>{
                                            if(err){
                                                console.log(err);
                                                isError(placingErrMsg,reRenderLocation)
                                            }  
                                        });
                                    }
                                }
                            })    
                        })
                        if(sourceType=='STORE'){
                            selectedProductData.map(m=>{
                                db.all(`SELECT inventoryAmount,inventoryValue FROM products WHERE productID  = '${m.productID}'`,(err,data)=>{
                                    console.log(data[0].inventoryValue ,'data')
                                    if(err){
                                        console.log(err);
                                      isError(fetchingErrMsg,reRenderLocation)
                                    }
                                    else{
                                        if(data.length){
                                            db.run(`UPDATE products SET inventoryAmount = inventoryAmount - ${parseFloat(m.productValue)}, inventoryValue = ${data[0].inventoryValue - parseFloat(m.unit)}  WHERE productID  = '${m.productID}'`,function(err){
                                                if(err){
                                                    console.log(err);
                                                    isError(placingErrMsg,reRenderLocation)
                                                }
                                            })
                                        }                        
                                    }
                                })
                            })
                        }
                        if(destinationType == 'STORE'){
                            selectedProductData.map(m=>{
                                db.all(`SELECT inventoryAmount,inventoryValue FROM products WHERE productID  = '${m.productID}'`,(err,data)=>{
                                    console.log(data[0].inventoryValue ,'data')
                                    if(err){
                                        console.log(err);
                                      isError(fetchingErrMsg,reRenderLocation)
                                    }
                                    else{
                                        if(data.length){
                                            db.run(`UPDATE products SET inventoryAmount = inventoryAmount + ${parseFloat(m.productValue)}, inventoryValue = ${data[0].inventoryValue + parseFloat(m.unit)}  WHERE productID  = '${m.productID}'`,function(err){
                                                if(err){
                                                    console.log(err);
                                                    isError(placingErrMsg,reRenderLocation)
                                                }
                                            })
                                        }                        
                                    }
                                })
                            })
                        }
                        $('#sourceTitle').text(sourceName);
                        $('#destinationTitle').text(destinationName);
                        $("#myModal2").modal('show');
                    }
                })
            }
        }
    })
}

closeModal=()=>{
    $('#myModal2').modal('hide');
    window.location.href = reRenderLocation;
} 

$("#myModal2").on("hidden.bs.modal", function () {
    window.location.href= reRenderLocation
});

