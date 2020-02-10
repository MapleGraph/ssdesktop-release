var resData=[];
var store = JSON.parse(localStorage.getItem('loginResponse'));
var storeID = store.storeList[0].storeID;
var userID = store.userID;
var userName = localStorage.getItem('phoneNumber');
var stockRequestNumber = localStorage.getItem('stockRequestNumber');
var stockRequestDate = localStorage.getItem('stockRequestDate');

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='inventoryDashboard.html'

var draftList = [],cartList = [],allItemsList = [],combinedList = [],finalList = [],stockList=[];
var brands,categories,requisitionDetail,requisitionSummaryID,requisitionID,stockReference,response,totalPrice,totalUnits;
var dateTimeLocal;
var newStockReference;
var placeOrderList=[];
var noPrint = true;
var deleteID;
var disabled = false;

$(async()=>{
    await getMenu('View Order Draft')
    await backNavigation()
    
    $('.select2').select2();
    initiateMultiSelect()
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


deleteDraft=()=>{     
    
    const dialogOptions = {type: 'info',buttons: ['Cancel', 'OK'], message: 'Are you sure you want to delete this order?'}
    dialog.showMessageBox(dialogOptions, async i => {
        if(i){

            var stockRequestNumber = localStorage.getItem('stockRequestNumber');
            stockRequestNumber--;
            localStorage.setItem('stockRequestNumber',stockRequestNumber);
            
            db.all('DELETE FROM stockRequisitionSummary WHERE isDraftMode = 1')
            window.location.href=reRenderLocation
        }
    })
}

function rowStyle(row,index){

    return {classes:'rowStyle'}
}

function rowAttributes(row,index){

    return {id:'row'+row.productID}
}

function total(value,row){

    let total = row.price * row.quantity;
    return (total.toFixed(2));
}

function displayTable(){                
    db.all(`SELECT json FROM stockRequisitionSummary WHERE isDraftMode = 1`,function(err, row) {
        if(err){
            console.log(err)
             isError(fetchingErrMsg,reRenderLocation)
        }
        else{            
            if(row.length){
                requisitionDetail = row[0].json;
                console.log(requisitionDetail,'requisitionDetail')
                parsedRequisitionDetail = JSON.parse(requisitionDetail);
                console.log(parsedRequisitionDetail,'parsedRequisitionDetail')
                draftList = parsedRequisitionDetail.requisitionProducts
                stockList = draftList;
            }
            console.log(draftList,'draftList')
            $('#stockList').bootstrapTable('destroy');
            $('#stockList').bootstrapTable(
                {data:draftList,
                search:false,
                reinit: true,
                trimOnSearch:false
            })
            var dataTime =  (parsedRequisitionDetail.requisitionTimeLocal).split(" ")
            stockReference = parsedRequisitionDetail.stockReference
            $('#orderID').text(stockReference)
            $('#mainOrderID').text(stockReference)
            $('#date').text(dataTime[0])
            $('#time').text(dataTime[1])
            $('#totalItemNumber').text('Total Items : ' + parsedRequisitionDetail.totalItemNumber)
            $('#totalPrice').text('Total : ' + parsedRequisitionDetail.totalCost)
            db.all('SELECT *  FROM vendors',(err,data)=>{
                if(err){
                    console.log(err)
                     isError(fetchingErrMsg,reRenderLocation)
                }
                else{
                    if(data.length){
                        var vendorDetail = data[0]
                        $('#vendorName').text(vendorDetail.vendorName);
                        $('#rsCode').text(vendorDetail.vendorGUID);
                        $('#gstNumber').text(vendorDetail.GSTNumber);
                    }
                }
            })
        }
    })
}

function draft(){
    $('#reviewSection').css('display','none');
    $('#addMoreSection').css('display','none');
    $('#draftSection').css('display','block');
}

async function edit(){
    
    parsedRequisitionDetail = JSON.parse(requisitionDetail);
    draftList = parsedRequisitionDetail.requisitionProducts;

    cartList = [];
    finalList = draftList;

    console.log('draftList',draftList)

    for(let i=0;i<draftList.length;i++)
    {	
        let productID = draftList[i].productID;
        productID = JSON.stringify(productID);

        cartList[JSON.stringify(productID)] = draftList[i].quantity;
    }

    console.log(cartList,'cartList')

    $('#cartList').bootstrapTable('destroy');
    $('#cartList').bootstrapTable({
        data:draftList,
        search:false,
        reinit: true,
        trimOnSearch:false
    })

    $('#draftSection').css('display','none');
    $('#reviewSection').css('display','block');
    renderTotalData()

}

function renderReviewCart(value,row){

    return '<div style="display:flex;flex-direction:row">' + '<button class="cartBtn" onclick="decrementReview(this)" value=review'+row.productID+'>-</button>' + '<input class="quantity" type="number" id=review'+row.productID+' value='+row.quantity+' onchange="handleReviewChange(this)" onkeypress="return event.charCode >= 48"></input>' + '<button class="cartBtn" onclick="incrementReview(this)" value=review'+row.productID+'>+</button>' + '</div>';
}

function incrementReview(element){

    let productID = element.value;
    let ID = '#'+productID;

    let quantity = $(ID).val();
    quantity++;

    $(ID).val(quantity)
    
    productID = productID.substr(6,productID.length)
    cartList[JSON.stringify(productID)] = quantity;
    console.log(cartList)
    stockList.map(m=>{
        if(m.productID==productID){
            m.unit = quantity
            m.quantity = quantity
        }
        return m
    })
    renderTotalData()
}

function decrementReview(element){

    let productID = element.value;
    let ID = '#'+productID;

    let quantity = $(ID).val();
    quantity--;

    if(quantity<0 || quantity==0){
        quantity = 0;
    }

    $(ID).val(quantity);

    productID = productID.substr(6,productID.length)

    if(quantity == 0)
    {
        delete cartList[JSON.stringify(productID)];
    }
    else{
        cartList[JSON.stringify(productID)] = quantity;
    }
    stockList.map(m=>{
        if(m.productID==productID){
            m.unit = quantity
            m.quantity = quantity
        }
        return m
    })
    console.log(cartList)
    renderTotalData()
}


function handleReviewChange(element){

    let productID = element.id;
    let ID = '#'+productID;
    let quantity = parseInt(element.value);

    if(quantity == NaN){
        quantity = 0;
    }

    $(ID).val(quantity)

    productID = productID.substr(6,productID.length)

    if(quantity == 0){
        delete cartList[JSON.stringify(productID)];
    }
    else{
        cartList[JSON.stringify(productID)] = quantity;
    }

    console.log(element.id,quantity)
    console.log(cartList)

    renderTotalData();
}


function deleteItem(value,row){

    return '<div style="cursor:pointer;" onclick="handleDelete(this)" id=delete'+row.productID+'> <img style="width:36px" src = "../../assets/img/ic-trash-24-gray.png"> </div>';
}

function handleDelete(element){

    let productID = element.id;
    deleteID =  productID.substr(6,productID.length)

    $('#deleteModal').modal('show');

//     delete cartList[JSON.stringify(productID)];
//     console.log(cartList)

//     let ID = '#row'+productID;
//     console.log(ID)
//     $(ID).remove();
//     finalList = finalList.filter(m=>(
//        m.productID!= productID
//    ))
//     renderTotalData()
    // review()
}

function closeModalTarget(element){

    var id = '#' + $(element).data('target');
    $(id).modal('hide');
}

function finalDelete(){

    delete cartList[JSON.stringify(deleteID)];
    console.log(cartList)

    let ID = '#row'+deleteID;
    console.log(ID)

    $(ID).remove();
    finalList = finalList.filter(m=>(
       m.deleteID!= deleteID
   ))

   $('#deleteModal').modal('hide');

    renderTotalData()
}

async function addMore(){

    // $('#incomeHead').val('<option>Select Division</option>')
    // $('#brands').val('<option>Select Brand</option>')

    // console.log(draftList,'draftList')
    var oldCartList = $.extend(true, [], cartList);
    // console.log('cartList',cartList)
    // console.log('oldCartList',oldCartList)

        // db.all("SELECT DISTINCT incomeHead FROM products", function(err, row) {
        //     if(err){
        //         console.log(err)
        //        isError(fetchingErrMsg,reRenderLocation)
        //     }
        //     else{           
        //         if(row.length){
        //             var incomeHead = row;
        //             for(let i=0;i<incomeHead.length;i++)
        //             {
        //                 incomeHeadValue = incomeHead[i].incomeHead;
        //                 incomeHeadName = incomeHead[i].incomeHead;
        //                 element = '<option value='+incomeHeadValue+'>'+incomeHeadName+'</option>'
        //                 $('#incomeHead').append(element);
        //             }
        //         }
        //     }
        // });

        incomeHead = await new Promise((resolve,reject)=>{
            db.all("SELECT DISTINCT incomeHead FROM products",(err,data)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log(data)
                    resolve(data)
                }
            });
        })

        if(incomeHead.length){
            for(let i=0;i<incomeHead.length;i++)
            {
                incomeHeadValue = incomeHead[i].incomeHead;
                incomeHeadName = incomeHead[i].incomeHead;
                element = '<option value='+incomeHeadValue+'>'+incomeHeadName+'</option>'
                $('#incomeHead').append(element);
            } 
        }

        loader(1);

        db.all("SELECT DISTINCT A.productID, SUM(A.inventory) AS inventory,B.productName,B.incomeHead,B.brandID,B.productGUID AS basePack,B.brandID,B.brandName,B.categoryID,B.categoryName,B.price,B.MRP AS mrp,B.lowStockAlertQuantity,B.variantID,B.variantName,B.barcode,B.taxIDs FROM batchProductVariants AS A INNER JOIN products AS B ON A.productID = B.productID  GROUP BY A.productID ORDER BY SUM(A.inventory) DESC", function(err, row) {
            if(err){
                console.log(err)
               isError(fetchingErrMsg,reRenderLocation)
            }
            else{              
                if(row.length){

                    allItemsList = row;
            
                    for(let i=0;i<allItemsList.length;i++)
                    {
                        if(allItemsList[i].inventory<0){
                            allItemsList[i].inventory =0
                        }	

                        if(allItemsList[i].lowStockAlertQuantity<0){
                            allItemsList[i].lowStockAlertQuantity =0
                        }	

                        allItemsList[i].unit = 0;
                        allItemsList[i].quantity = 0;

                        // unit = allItemsList[i].lowStockAlertQuantity - allItemsList[i].inventory;
                        // quantity = allItemsList[i].lowStockAlertQuantity - allItemsList[i].inventory;
                        
                        // if(unit<0){
                        //     unit = 0;
                        //     quantity = 0;
                        // }

                        // allItemsList[i].unit = unit;
                        // allItemsList[i].quantity = quantity;
                        
                        // if(quantity>0)
                        // {  
                        //     x = JSON.stringify(allItemsList[i].productID);
                        //     cartList[JSON.stringify(x)] = quantity;
                        //     var l = Object.keys(cartList).length
                        //     if(l){
                        //     $('#stockAddedCount').text(`(${l})`) 
                        //     }
                        //     else{
                        //         $('#stockAddedCount').text(``)
                        //     }
                        // }
                    }
                
                    for(let productID in oldCartList)
                    {
                        for(let j=0;j<allItemsList.length;j++)
                        {
                            var x = JSON.stringify(allItemsList[j].productID);  

                            if(productID == JSON.stringify(x))
                            {
                                allItemsList[j].quantity = oldCartList[productID];
                                console.log('quantity',oldCartList[productID])
                                console.log(allItemsList[j])
                                break;
                            }
                        }
                    }

                    // for(let i in cartList)
                    // {
                    //     for(let j in oldCartList)
                    //     {
                            
                    //         if(i == j)
                    //         {
                    //             cartList[i] = oldCartList[j];
                    //             break;
                    //         }
                    //     }
                    // }

                    allItemsList.sort((a,b)=>{
                        return b.quantity-a.quantity;
                    })
                    
        //             console.log(allItemsList,'allItemsList')
        //             console.log(cartList,'cartList')

                    let modifiedData = allItemsList.filter(o1 => !stockList.some(o2 => o1.productID=== o2.productID));
                    stockList = [...modifiedData,...stockList]
                    // console.log(stockList,'stockList')
        
                    $('#allItemsList').bootstrapTable('destroy')
                    $('#allItemsList').bootstrapTable(
                        {
                            data:allItemsList,
                            search:true,
                            reinit: true,
                            trimOnSearch:false,
                            pagination:true
                        }
                    );
                    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                    $('.customInputSearchDiv').addClass('flex-row margin-20')
                }
                $('#reviewSection').css('display','none');
                $('#addMoreSection').css('display','block');
            }
        });
        
        getStocks()
        filterBrands()
}

function filterBrands(){
    $('#brands').empty();
    let x = $('#incomeHead').val()
    // $('#select2-chosen-2').html("Select Brand")
    // $('#allItemsList').bootstrapTable('destroy')
  
    db.all(`SELECT DISTINCT brandID,brandName FROM products WHERE incomeHead LIKE  '%${x}%' GROUP BY brandID ORDER BY brandName`, function(err, row) {
        if(err){
            console.log(err)
             isError(fetchingErrMsg,reRenderLocation)
        }
        else{         
            brandsData = row;
           if(brandsData){
            //    $("#brands").html('<option>Select Brand</option>');
               brandsData.map(m=>{
                   brandNameData = m.brandName;
                   brandIdData = m.brandID;
                   element = '<option value='+brandIdData+'>'+brandNameData+'</option>'
                   $('#brands').append(element);
               })
           }
           else{
            //    $("#brands").html('<option>Select Brand</option>');
           }
           
           initiateMultiSelect()
        }
    });
}

// function getStockList(){

//     let brandsValue = $("#brands").val()
//     let incomeHeadValue = $('#incomeHead').val()

//     $('#allItemsList').bootstrapTable('destroy')

//     console.log('brandsValue',brandsValue,'incomeHeadValue',incomeHeadValue)

//     var filterQuery = ''
//     if(incomeHeadValue != '0' && (brandsValue == "0" || brandsValue.length == "0")) {
//         filterQuery = `WHERE  B.incomeHead Like '%${incomeHeadValue}%'`
//     }
//     else if(incomeHeadValue != '0' && (brandsValue != "0" || brandValue.length)) {
//         filterQuery = `  WHERE B.brandID IN (${brandsValue})  AND B.incomeHead LIKE  '%${incomeHeadValue}%'`
//     }

//     var query = `SELECT DISTINCT A.productID, SUM(A.inventory) AS inventory,B.productName,B.productGUID AS basePack,B.brandID,B.brandName,B.unitsPerCase,B.categoryID,B.categoryName,B.price,B.MRP AS mrp,B.lowStockAlertQuantity,B.variantID,B.variantName,B.barcode,B.taxIDs FROM batchProductVariants AS A INNER JOIN products AS B ON A.productID = B.productID  ${filterQuery} GROUP BY A.productID ORDER BY SUM(A.inventory) DESC`
//     console.log(query,'query')

//     db.all(query, function(err, row) {
//         if(err){
//             console.log(err)
//             isError(fetchingErrMsg,reRenderLocation)
//         }
//         else{                
//             if(row.length){
//                 allItemsList = row;
//                 for(let i=0;i<allItemsList.length;i++){
//                 if(allItemsList[i].inventory<0){
//                     allItemsList[i].inventory =0
//                 }	
//                 if(allItemsList[i].lowStockAlertQuantity<0){
//                     allItemsList[i].lowStockAlertQuantity =0
//                 }	
//                     unit = allItemsList[i].lowStockAlertQuantity - allItemsList[i].inventory;
//                     quantity = allItemsList[i].lowStockAlertQuantity - allItemsList[i].inventory;
        
//                     if(unit<0){
//                         unit=0;
//                         quantity=0;
//                     }
//                     unit = 0;
//                     quantity = 0;
//                     allItemsList[i].unit = unit;
//                     allItemsList[i].quantity = quantity;
        
//                     if(quantity>0)
//                     {
//                         x = JSON.stringify(allItemsList[i].productID);
//                         cartList[JSON.stringify(x)] = quantity;
//                         var l = Object.keys(cartList).length
//                         if(l){
//                         $('#stockAddedCount').text(`(${l})`) 
//                         }
//                         else{
//                             $('#stockAddedCount').text(``)
//                         }
//                     }
//                 }
//                 allItemsList.sort((a,b)=>{
//                     return b.unit-a.unit
//                 })
//                 console.log(allItemsList,'allItemsList')
//                 stockList = draftList
//                 let modifiedData = allItemsList.filter(o1 => !stockList.some(o2 => o1.productID=== o2.productID));
//                 stockList = [...modifiedData,...stockList]
//                 console.log(stockList,'stockList')
    
//             }
//             $('#allItemsList').bootstrapTable('destroy')
//             $('#allItemsList').bootstrapTable(
//                 {
//                     data:allItemsList,
//                     search:true,
//                     reinit: true,
//                     trimOnSearch:false,
//                     pagination:true
//                 }
//             );
//             $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
//             $('.customInputSearchDiv').addClass('flex-row margin-20')
//         }
//     });
// }

getStocks=()=>{
    var brandValue = $('#brands').val();
    var incomeHeadValue = $('#incomeHead').val()
    console.log(brandValue,'brandValue',incomeHeadValue,'incomeHeadValue')
    
    csPacks = $('#switchOption1').val() == '1' ? true : false
    normPacks = $('#switchOption2').val() == '1' ? true : false

    getFilteredStock(csPacks,normPacks,incomeHeadValue,brandValue)
}


getFilteredStock=(csPacks,normPacks,incomeHeadValue,brandValue)=>{
    console.log(csPacks,normPacks,incomeHeadValue,brandValue)
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
    if(csPacks && normPacks){
        filteredStockList= filteredStockList.filter(a=>a.inventory>0 && a.lowStockAlertQuantity>0)
    }
    else if(csPacks && !normPacks){
        filteredStockList= filteredStockList.filter(a=>a.inventory>0)
    }
    else if(!csPacks && normPacks){
        filteredStockList= filteredStockList.filter(a=>a.lowStockAlertQuantity>0)
    }
    else if(!csPacks && !normPacks){
        filteredStockList = filteredStockList
    }
    
    filteredStockList.sort((a,b)=>(b.unit) - (a.unit))
    console.log(filteredStockList,'filteredStockList')
    $('#allItemsList').bootstrapTable('destroy')
    $('#allItemsList').bootstrapTable(
        {
            data:filteredStockList,
            search:true,
            reinit: true,
            trimOnSearch:false,
            pagination:true
        }
    );

    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    $('.customInputSearchDiv').addClass('flex-row margin-20')
    $('#reviewSection').css('display','none');
    $('#addMoreSection').css('display','block');
    
    loader(0)
}

getClosingStockPacks=()=>{
    var v1 = $('#switchOption1').val()
    if(v1=='1'){
       $('#switchOption1').val('0')
       $('#switchOption1').attr('unchecked',true).attr('checked',false)
       getStocks()
    }
    else{
        $('#switchOption1').val('1')
        $('#switchOption1').attr('unchecked',false).attr('checked',true)
        getStocks()
    }  
}

getNormPacks=()=>{ 
    var v2 = $('#switchOption2').val()
    if(v2=='1'){
        $('#switchOption2').val('0')
        $('#switchOption2').attr('unchecked',true).attr('checked',false)
        getStocks()
    }
    else{
        $('#switchOption2').val('1')
        $('#switchOption2').attr('unchecked',false).attr('checked',true)
        getStocks()
    }
}

function renderCart(value,row){

    return '<div style="display:flex;flex-direction:row">' + '<button class="cartBtn" onclick="decrement(this)" value='+row.productID+'>-</button>' + '<input class="quantity" type="number" id='+row.productID+' value='+row.quantity+' onchange="handleChange(this)" onkeyup="handleChange(this)" onkeypress="return event.charCode >= 48"></input>' + '<button class="cartBtn" onclick="increment(this)" value='+row.productID+'>+</button>' + '</div>' ;
}

function increment(element){

    let productID = element.value;
    let ID = '#'+productID;

    let quantity = $(ID).val();
    quantity++;

    $(ID).val(quantity)

    cartList[JSON.stringify(productID)] = quantity;
    console.log(cartList)

    var l = Object.keys(cartList).length

    if(l){
    $('#stockAddedCount').text(`(${l})`) 
    }
    else{
        $('#stockAddedCount').text(``)
    }
}


function decrement(element){

    let productID = element.value;
    let ID = '#'+productID;

    let quantity = $(ID).val();
    quantity--;

    if(quantity<0 || quantity==0){
        quantity = 0;
    }

    $(ID).val(quantity);

    if(quantity == 0)
    {
        delete cartList[JSON.stringify(productID)];
    }
    else{
        cartList[JSON.stringify(productID)] = quantity;
    }
    console.log(cartList)
    var l = Object.keys(cartList).length

    if(l){
    $('#stockAddedCount').text(`(${l})`) 
    }
    else{
        $('#stockAddedCount').text(``)
    }
}


function handleChange(element){

    let productID = element.id;
    let ID = '#'+productID;
    var quantity;
    
    if(element.value){
        quantity = parseInt(element.value);
    }
    else{
        quantity = 0;
    }

    $(ID).val(quantity)
    console.log(quantity,'quantity')
    if(!quantity){
        delete cartList[JSON.stringify(productID)];
    }
    else{
        cartList[JSON.stringify(productID)] = quantity;
    }
    console.log(quantity,element.id)
    console.log(cartList)

    var l = Object.keys(cartList).length
    if(l){
    $('#stockAddedCount').text(`(${l})`) 
    }
    else{
        $('#stockAddedCount').text(``)
    }
}


function search(){

    let x = $('#categories').val()
    let y = $('#brands').val()

    //if(x !== 'Select Category' && y == 'Select Brand')
    if(x !== '0' && y.length == '0'){
        
        combinedList = [];

        for(let i=0;i<allItemsList.length;i++)
        {

            if(allItemsList[i].categoryID == x)
            {
                combinedList.push(allItemsList[i])
            }
        }

        console.log('categorylist',combinedList)
        
    }

    //else if(x == 'Select Category' && y !== 'Select Brand')
    else if(x == '0' && y.length !== '0'){
        
        combinedList = [];

        for(let i=0;i<allItemsList.length;i++)
        {

            if(allItemsList[i].brandID == y)
            {
                combinedList.push(allItemsList[i])
            }
        }

        console.log('brandList',combinedList)

    }			


    //else if(x !== 'Select Category' && y !== 'Select Brand')
    else if(x !== '0' && y.length !== '0'){

        combinedList = [];

        for(let i=0;i<allItemsList.length;i++)
        {

            if(allItemsList[i].categoryID == x && allItemsList[i].brandID == y)
            {
                combinedList.push(allItemsList[i])
            }
        }

        console.log('combinedList',combinedList)

    }

    else{

        combinedList = allItemsList;
    }


    for(let j=0;j<combinedList.length;j++)	
    {	
        let x = combinedList[j].productID;

        x = JSON.stringify(x);

        if(cartList[JSON.stringify(x)] !== undefined)
        {
            combinedList[j].quantity = cartList[JSON.stringify(x)];
        }
        else{
            combinedList[j].quantity = 0;
        }
    }

    $('#allItemsList').bootstrapTable('destroy');
    $('#allItemsList').bootstrapTable({
        data:combinedList,
        search:true,
        reinit: true,
        trimOnSearch:false
    })
    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    $('.customInputSearchDiv').addClass('flex-row margin-20')

}

function review(){
    
    finalList = [];
    var k=0;

    // console.log(allItemsList,'allItemsList',cartList,'cartList',stockList,'stockList')
    // console.log(cartList)

    for(let i in cartList)
    {
        for(let j=0;j<stockList.length;j++)
        {	
            let x = '"'+stockList[j].productID+'"';
            if(i == x)
            {
                finalList[k] = stockList[j];
                finalList[k].quantity = cartList[i];
                finalList[k].unit = cartList[i];
                k++;
                break;
            }
        }
    }

    if(finalList.length){
        $('#cartList').bootstrapTable('destroy');
        $('#cartList').bootstrapTable({
            data:finalList,
            search:false,
            reinit: true,
            trimOnSearch:false
        })
    
        $('#addMoreSection').css('display','none');
        $('#reviewSection').css('display','block');
        renderTotalData()
    }
    else{
        var message ='Select Quantity, You cant review a empty cart!'
        isError(message)
    }
}

renderTotalData=()=>{

    finalList = [];
    var k=0;

    for(let i in cartList)
    {
        for(let j=0;j<stockList.length;j++)
        {	
            let x = '"'+stockList[j].productID+'"';
            if(i == x)
            {
                finalList[k] = stockList[j];
                finalList[k].quantity = cartList[i];
                finalList[k].unit = cartList[i];
                k++;
                break;
            }
        }
    }

    console.log(finalList,'finalList')

    totalPrice=0;
    totalUnits=0;
    if(finalList.length){
        $('#stockAddedCount').text('('+finalList.length+')')
    }
    else{
        $('#stockAddedCount').text("")  
    }
    finalList.map(m=>{
        totalPrice += parseFloat(m.price)*m.quantity;
    })	

    totalPrice = totalPrice.toFixed(2)

    if(totalPrice){
        $('#totalPriceValue').html(totalPrice)		
    }
    else{
        totalPrice=0;  
        $('#totalPriceValue').html(totalPrice)	
    }

    totalUnits = finalList.length;
    $('#totalLines').html(totalUnits)

    console.log(totalUnits,totalPrice,'totalPrice')

}

async function placeOrder(type){

    console.log(type)
    console.log(cartList,'cartList')

    if(disabled){
        console.log('disabled')
        return false;
    }
    else{
        disabled = true;
    }

    var isEmpty = true
    for (x in cartList){
        isEmpty = false;
    }
    if(isEmpty){
        var message = 'Select Quantity, You can not place a zero quantity order!'
        disabled = false;
        isError(message)
        return false
    }

    placeOrderList = [];
    var suggestedQty;
    var isDraft=0;
    var k=0;

    if(type == 'draft'){
        isDraft = 1
    }
            
    console.log(finalList,'finalList')
                    
    for(let i in cartList)
    {
        for(let j=0;j<finalList.length;j++)
        {	
            let x = '"'+finalList[j].productID+'"';
            if(i == x)
            {
                suggestedQty = finalList[j].lowStockAlertQuantity - finalList[j].inventory;

                if(suggestedQty<0 || isNaN(suggestedQty)){
                    suggestedQty = 0;
                }

                placeOrderList[k] = finalList[j];
                placeOrderList[k].quantity = cartList[i];
                placeOrderList[k].suggestedQty = suggestedQty;
                placeOrderList[k].costPrice = 0;
                placeOrderList[k].displayQuantity = cartList[i];
                placeOrderList[k].unitID = 1;
                placeOrderList[k].unitName = "Piece";
                placeOrderList[k].displayUnitID = 1;
                placeOrderList[k].remarks = "";
                placeOrderList[k].displayUnitName = "Piece";
                placeOrderList[k].productValue = (placeOrderList[k].quantity * parseFloat(placeOrderList[k].price)).toFixed(3) ; 
                
                k++;
                break;
            }
        }
    }

    console.log(placeOrderList,'placeOrderList')

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
    dateTimeLocal = timeLocal
    var dateStr = year+""+month+""+day;

    console.log(timeLocal,dateLocal,dateStr)

    //var timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
    var timezone="Asia/Kolkata";
    var partyCode;
    var dataInsert = false;
    var countValue = 0;
    var vendorID;
    var vendorGUID;

    var partyCodeObj = await new Promise((resolve)=>{
        db.get(`SELECT partyCode FROM listStores`,(error,data)=>{
            if(error){
                isError(fetchingErrMsg)
            }
            else{
                resolve(data)
            }
        })
    })

    partyCode = partyCodeObj.partyCode

    var vendorObj = await new Promise((resolve)=>{
        db.get('SELECT vendorID,vendorName,vendorGUID FROM vendors',(error,data)=>{
            if(error){
                isError(fetchingErrMsg)
            }
            else{
                resolve(data)
            }
        })
    })
    vendorID= vendorObj.vendorID
    vendorGUID= vendorObj.vendorGUID

    db.all('DELETE FROM stockRequisitionSummary WHERE isDraftMode = 1',()=>{

        dataInsert = true

        if(dataInsert){
            var data = {
                ID:null,
                requisitionID:null,
                vendorID:vendorID,
                isSync:0,
                status:'Placed',
                useChain:1,
                email:'',
                sendSelf:'',
                sourceID:storeID,
                sourceType:'STORE',
                destinationID:storeID,
                destinationType:'STORE',
                remarks:'',
                isDraft:isDraft,
                requisitionProducts:placeOrderList,
                isError:'',
                userID:userID,
                user:userID,
                userName:userName,
                requisitionTimeLocal:timeLocal,
                totalCost:totalPrice,
                timezone:timezone,
                stockReference:stockReference,
                billNumber:'',
                transactionDate:dateLocal,
                totalItemNumber:placeOrderList.length
            }

            db.run("INSERT INTO stockRequisitionSummary VALUES ($ID, $requisitionID,$vendorID, $isSync,$status, $isError,$sourceID, $sourceType,$destinationID, $destinationType, $userID,$userName, $email,$totalItemNumber, $requisitionTimeLocal,$totalCost, $timezone,$remarks, $isDraftMode,$stockReference, $billNumber,$transactionDate,$json)",{
                $ID:null,
                $requisitionID:null,
                $vendorID:vendorID,
                $isSync:0,
                $status:'Placed',
                $isError:'',
                $sourceID:data.sourceID,
                $sourceType:data.sourceType,
                $destinationID:data.destinationID,
                $destinationType:data.destinationType,
                $userID:userID,
                $userName:userName,
                $email:data.email,
                $totalItemNumber:data.totalItemNumber,
                $requisitionTimeLocal:timeLocal,
                $totalCost:totalPrice,
                $timezone:timezone,
                $remarks:data.remarks,
                $isDraftMode:data.isDraft,
                $stockReference:stockReference,
                $billNumber:'',
                $transactionDate:dateLocal,
                $json: JSON.stringify(data),
            },(err)=>{
                if(err){
                    console.log(err)
                    var message='Error in requesting order!'
                    isError(message,reRenderLocation)
                }else{ 
                    if( isDraft == 0){
                        response = {};
                        response.stockReference = stockReference;
                        response.amount = totalPrice;
                        response.totalItems = totalUnits;
                        response.vendorGUID = vendorGUID;
                        $('#vendorGUID').text('Code -' +response.vendorGUID)
                        $('#srID').html("&nbsp" + response.stockReference)
                        $('#amount').html("&nbsp" + response.amount)
                        $('#totalItems').html("&nbsp" + response.totalItems)
                        
                        $('#orderModal').modal('show')
                    }
                    if( isDraft == 1){
                        $('#draftModal').modal('show')
                    }
                    noPrint = true
                }
            })
        }
    })
}

triggerPrintPdf = () => {
    noPrint = false;
    var currentTimestamp = moment().format("YYYYMMDDHHmmss")
    $('#orderModal').modal('hide');
    var table1columns = [
        {title: "#", dataKey: "SNo"},
        {title: "Item Name", dataKey: "productName"}, 
        {title: "Quantity", dataKey: "quantity"},
        {title: "MRP", dataKey: "mrp"},
        {title: "TUR", dataKey: "price"},
        {title: "Total Price", dataKey: "productValue"},
        // {title: "Total", dataKey: "totalPrice"}, 
    ];
        
    var columnsObj ={
        table1columns,
    }

    placeOrderList.map((m,i)=>{
        m['SNo'] = i+1
    })
 
    var tableData = placeOrderList;

    console.log(placeOrderList,'placeOrderList')

    var billInfo={
        'billTime':dateTimeLocal,
    }

    var orderInfo={
        'totalPrice' : totalPrice,
        'totalItems' : tableData.length,
    }

    var docInfo = {
        'title' : 'Bill Summary',
        'orderInfo':orderInfo,
        'billInfo':billInfo,
        'taxShown': false,
        'storeInfoShown' :true,
        'fileName' : `${stockReference}_${currentTimestamp}.pdf`,
    }

    console.log(tableData)
    printPdf(columnsObj,tableData,docInfo) 
};

closeModal=(id)=>{
    $(`#`+id).modal('hide');
}

$("#successModal").on("hidden.bs.modal", function () {
    window.location.href= reRenderLocation
})

$("#draftModal").on("hidden.bs.modal", function () {
    window.location.href=reRenderLocation
});

$("#orderModal").on("hidden.bs.modal", function () {
    if(noPrint){
        window.location.href= reRenderLocation
    }
})