var resData=[];
var store = JSON.parse(localStorage.getItem('loginResponse'));
var storeID = store.storeList[0].storeID;
var userID = store.userID;
var userName = localStorage.getItem('phoneNumber');
var stockRequestNumber = localStorage.getItem('stockRequestNumber');
var stockRequestDate = localStorage.getItem('stockRequestDate');


var brands,categories,stockList,closingStockList=[],combinedList,finalList,x,cartList=[],response;
var brandsList, incomeHeadList,brandsData,totalPrice,totalUnits;filterPacksQuery='';
var placeOrderList=[];
var dateTimeLocal;
var stockReference ;
var noPrint = true;
var disabled = false;
 
document.addEventListener("mousewheel", function(event){
    if(document.activeElement.type === "number"){
        document.activeElement.blur();
    }
});

var fetchingErrMsg='Error in Fetching order!'
var reRenderLocation='inventoryDashboard.html'

$(document).ready(async function(){ 

    await getMenu('Place New Order')
    await backNavigation()

    $('.select2').select2();
    initiateMultiSelect()

    db.all("SELECT DISTINCT incomeHead FROM products", function(err, row) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{            
            if(row.length){
                var incomeHead = row;
                for(let i=0;i<incomeHead.length;i++)
                {
                    incomeHeadValue = incomeHead[i].incomeHead;
                    incomeHeadName = incomeHead[i].incomeHead;
                    element = '<option value='+incomeHeadValue+'>'+incomeHeadName+'</option>'
                    $('#incomeHead').append(element);
                }
            }
        }
    });
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

function renderStockList(){
    loader(1)
    var query ="SELECT DISTINCT A.productID, SUM(A.inventory) AS inventory,B.productName,B.productGUID AS basePack,B.brandID,B.brandName,B.incomeHead,B.brandID,B.unitsPerCase,B.categoryID,B.categoryName,B.price,B.MRP AS mrp,B.lowStockAlertQuantity,B.variantID,B.variantName,B.barcode,B.taxIDs FROM batchProductVariants AS A INNER JOIN products AS B ON A.productID = B.productID  GROUP BY A.productID ORDER BY SUM(A.inventory) DESC"

    // console.log(query,'query')
    db.all(query, function(err, row) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{             
            if(row.length){
                stockList = row;
                cartList = []
                console.log(stockList,'stockListstockList')
                for(let i=0;i<stockList.length;i++){
                    if(stockList[i].inventory<0){
                        stockList[i].inventory =0
                    }	
                    if(stockList[i].lowStockAlertQuantity<0){
                        stockList[i].lowStockAlertQuantity =0
                    }
                    unit = stockList[i].lowStockAlertQuantity - stockList[i].inventory;
                    quantity = stockList[i].lowStockAlertQuantity - stockList[i].inventory;
                    if(unit<0){
                        unit=0;
                        quantity=0;
                    }
                    stockList[i].unit = unit;
                    stockList[i].quantity = quantity;

                    if(quantity>0)
                    {
                        x = JSON.stringify(stockList[i].productID);
                        console.log(x,'xx')
                        cartList[JSON.stringify(x)] = quantity;
                       var l = Object.keys(cartList).length
                       if(l){
                        $('.stockAddedCount').text(`(${l})`) 
                       }
                       else{
                           $('.stockAddedCount').text(``)
                       }
                    }

                    // new code 

                    if(stockList[i].inventory){
                        closingStockList.push(stockList[i]);
                    }

                    //
                }
                
                console.log('closingStockList',closingStockList)
                console.log(cartList,'cartList')
                stockList.sort((a,b)=>{
                    return b.unit-a.unit
                })
                $('#stockList').bootstrapTable('destroy')
                $('#stockList').bootstrapTable(
                    {
                        data:stockList,
                        search:true,
                        reinit: true,
                        trimOnSearch:false,
                        pagination:true,
                    }
                );
                loader(0)
                $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                $('.customInputSearchDiv').addClass('flex-row margin-20')
                // $('.sortable').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="sortDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
            }
        }

    });

}

function filterBrands(){
    $('#brands').empty();
    let x = $('#incomeHead').val()
    //$('#select2-chosen-2').html("All Brands")
    // $('#stockList').bootstrapTable('destroy')
  
    db.all(`SELECT DISTINCT brandID,brandName FROM products WHERE incomeHead LIKE  '%${x}%' GROUP BY brandID ORDER BY brandName`, function(err, row) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{           
            brandsData = row;
            console.log(brandsData,'brandsData')
            if(brandsData.length){
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
    });
}

// function getStockList(filterType){

//     closingStockList = [];
//     let brandsValue = $("#brands").val()
//     let incomeHeadValue = $('#incomeHead').val()
//     $('#stockList').bootstrapTable('destroy')
//     console.log('brandsValue',brandsValue)

//     if(filterType=='normLevelPacks'){
//         filterPacksQuery = `HAVING B.lowStockAlertQuantity > 0`
//     }
//     else  if(filterType=='allPacks'){
//         filterPacksQuery = ``
//     }

//     var filterQuery = ''
//     if(incomeHeadValue != '0' && (brandsValue == "0" || brandsValue.length == "0")) {
//         filterQuery = `WHERE  B.incomeHead Like '%${incomeHeadValue}%'`
//     }
//     else if(incomeHeadValue != '0' && (brandsValue != "0" || brandValue.length)) {
//         filterQuery = `  WHERE B.brandID IN (${brandsValue})  AND B.incomeHead LIKE  '%${incomeHeadValue}%'`
//     }

//     var query = `SELECT DISTINCT A.productID, SUM(A.inventory) AS inventory,B.productName,B.productGUID AS basePack,B.brandID,B.brandName,B.unitsPerCase,B.categoryID,B.categoryName,B.price,B.MRP AS mrp,B.lowStockAlertQuantity,B.variantID,B.variantName,B.barcode,B.taxIDs FROM batchProductVariants AS A INNER JOIN products AS B ON A.productID = B.productID  ${filterQuery} GROUP BY A.productID  ${filterPacksQuery} ORDER BY SUM(A.inventory) DESC`
//     console.log(query,'query')

//     db.all(query, function(err, row) {
//         if(err){
//             console.log(err)
//             isError(fetchingErrMsg,reRenderLocation)
//         }
//         else{                
//             stockList = row;
//             cartList = []
//             for(let i=0;i<stockList.length;i++){
//                 if(stockList[i].inventory<0){
//                     stockList[i].inventory =0
//                 }	
//                 if(stockList[i].lowStockAlertQuantity<0){
//                     stockList[i].lowStockAlertQuantity =0
//                 }	
//                 unit = stockList[i].lowStockAlertQuantity - stockList[i].inventory;
//                 quantity = stockList[i].lowStockAlertQuantity - stockList[i].inventory;
    
//                 if(unit<0){
//                     unit=0;
//                     quantity=0;
//                 }
//                 stockList[i].unit = unit;
//                 stockList[i].quantity = quantity;
    
//                 if(quantity>0)
//                 {
//                     x = JSON.stringify(stockList[i].productID);
//                     cartList[JSON.stringify(x)] = quantity;
//                     var l = Object.keys(cartList).length
//                     if(l){
//                     $('.stockAddedCount').text(`(${l})`) 
//                     }
//                     else{
//                         $('.stockAddedCount').text(``)
//                     }
//                 }

//                 // new code 

//                 if(stockList[i].inventory){
//                     closingStockList.push(stockList[i]);
//                 }
//                 //
//             }
//                 stockList.sort((a,b)=>{
//                 return b.unit-a.unit
//                 })
//                 console.log(stockList,'stockListstockList')
//                 console.log('closingStockList',closingStockList)
//                 $('#stockList').bootstrapTable('destroy')
//                 $('#stockList').bootstrapTable(
//                 {
//                     data:stockList,
//                     search:true,
//                     reinit: true,
//                     trimOnSearch:false,
//                     pagination:true,
                    
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
    $('#stockList').bootstrapTable('destroy')
    $('#stockList').bootstrapTable(
        {
            data:filteredStockList,
            search:true,
            reinit: true,
            trimOnSearch:false,
            pagination:true
        }
    );
    loader(0)
    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    $('.customInputSearchDiv').addClass('flex-row margin-20')
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


// normLevelPacks=()=>{
//     var v = $('#switchOption1').val()
//     if(v=='1'){
//         console.log(v)
//         getStockList('allPacks')
//         $('#switchOption1').val('0')
//         $('#switchOption1').attr('unchecked',true).attr('checked',false)
//     }
//     else{
//         console.log(v)
//         getStockList('normLevelPacks')
//         $('#switchOption1').val('1')
//     }
    
// }

// function closingStockLevelPacks(){

//     var v = $('#switchOption2').val()
//     console.log(v)

//     if(v == '1'){

//         $('#switchOption2').val('0')
//         $('#switchOption2').attr('unchecked',true).attr('checked',false)

//         $('#stockList').bootstrapTable('destroy')
//         $('#stockList').bootstrapTable(
//         {
//             data: stockList,
//             search:true,
//             reinit: true,
//             trimOnSearch:false,
//             pagination:true,
            
//         })
//     }
//     else{
//         $('#switchOption2').val('1')

//         $('#stockList').bootstrapTable('destroy')
//         $('#stockList').bootstrapTable(
//         {
//             data: closingStockList,
//             search:true,
//             reinit: true,
//             trimOnSearch:false,
//             pagination:true,
            
//         })
//     }

// }


function rowStyle(row,index){
    return {classes:'rowStyle'}
}

function rowAttributes(row,index){

    return {id:'row'+row.productID}
}

 search=()=>{
    let x = $('#incomeHead').val()
    let y = $('#brands').val()

    console.log(x,y,'xy')

//  if(x !== 'All Divisions' && y == 'All Brands')
    if(x !== '0' && y.length == '0'){
        
        combinedList = [];
        

        for(let i=0;i<stockList.length;i++)
        {

            if(stockList[i].incomeHead == x)
            {
                combinedList.push(stockList[i])
            }
        }
        
    }
    
//  else if(x == 'All Category' && y !== 'All Brands')
    else if(x == '0' && y.length !== '0'){
        
        combinedList = [];

        for(let i=0;i<stockList.length;i++)
        {

            if(stockList[i].brandID == y)
            {
                combinedList.push(stockList[i])
            }
        }

        console.log('brandList',combinedList)

    }			

//  else if(x !== 'All Category' && y !== 'All Brands')
    else if(x !== '0' && y.length !== '0'){

        combinedList = [];

        for(let i=0;i<stockList.length;i++)
        {

            if(stockList[i].categoryID == x && stockList[i].brandID == y)
            {
                combinedList.push(stockList[i])
            }
        }

        console.log('combinedList',combinedList)

    }

    else{

        combinedList = stockList;
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

    $('#stockList').bootstrapTable('destroy');
    $('#stockList').bootstrapTable({
        data:stockList,
        search:true,
        reinit: true,
        trimOnSearch:false
    })
    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    $('.customInputSearchDiv').addClass('flex-row margin-20')
    
}

function renderCart(value,row){
    return '<div style="display:flex;flex-direction:row">' + '<button class="cartBtn" onclick="decrement(this)" value='+row.productID+'>-</button>' + '<input class="quantity" type="number" min="0" id='+row.productID+' value='+row.quantity+' onchange="handleChange(this)" onkeyup="handleChange(this)"  onkeypress="return event.charCode >= 48"></input>' + '<button class="cartBtn" onclick="increment(this)" value='+row.productID+'>+</button>' + '</div>' ;
}

function increment(element){

    let productID = element.value;
    let ID = '#'+productID;

    let quantity = $(ID).val();
    quantity++;

    $(ID).val(quantity)
    		
    stockList.map(m=>{
        if(m.productID==productID){
            m.unit = quantity
            m.quantity = quantity
        }
        return m
    })
    cartList[JSON.stringify(productID)] = quantity;
    console.log(cartList)

    var l = Object.keys(cartList).length

    if(l){
    $('.stockAddedCount').text(`(${l})`) 
    }
    else{
        $('.stockAddedCount').text(``)
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
    		
    stockList.map(m=>{
        if(m.productID==productID){
            m.unit = quantity
            m.quantity = quantity
        }
        return m
    })
    console.log(cartList)
    var l = Object.keys(cartList).length
    if(l){
    $('.stockAddedCount').text(`(${l})`) 
    }
    else{
        $('.stockAddedCount').text(``)
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

    stockList.map(m=>{
        if(m.productID==productID){
            m.unit = quantity
            m.quantity = quantity
        }
        return m
    })
    console.log(quantity,element.id)
    console.log(cartList)
    var l = Object.keys(cartList).length
    if(l){
    $('.stockAddedCount').text(`(${l})`) 
    }
    else{
        $('.stockAddedCount').text(``)
    }
}


function review(){

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
                k++;
                break;
            }
        }
    }

    if(finalList.length){
            $('#reviewStockTable').bootstrapTable('destroy');
            $('#reviewStockTable').bootstrapTable({
                data:finalList,
                search:true,
                reinit: true,
                trimOnSearch:false
            })
            $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
            $('.customInputSearchDiv').addClass('flex-row margin-20')

            $('#placeNewOrder').css('display','none');
            $('#reviewStock').css('display','block');
            $('#reviewTableFooter').css('display','flex');
            renderTotalData()
    }
    else{
        var message = 'Select Quantity, You cant review an empty cart!'
        isError(message)
        goBack()
    }
}

renderTotalData=()=>{

    console.log(finalList,'finalList')
    console.log(cartList,'cartList')

    totalPrice=0;
    totalUnits=0;
    if(finalList.length){
        $('.stockAddedCount').text('('+finalList.length+')')
    }
    else{
        $('.stockAddedCount').text("")  
    }
    finalList.map(m=>{
        totalPrice += parseFloat(m.price)*m.unit
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


async function goBack(){

    console.log('go back',cartList)
    var l = Object.keys(cartList).length
    if(l){
    $('.stockAddedCount').text(`(${l})`) 
    }
    else{
        $('.stockAddedCount').text(``)
    }

    await getStocks()

    $('#reviewStock').css('display','none');
    $('#placeNewOrder').css('display','block');
    $('#reviewTableFooter').css('display','none');

    // for(let j=0;j<stockList.length;j++)	
    // {	    
    //     let x = stockList[j].productID;

    //     x = JSON.stringify(x);

    //     if(cartList[JSON.stringify(x)] !== undefined)
    //     {
    //         stockList[j].quantity = cartList[JSON.stringify(x)];
    //     }
    //     else{
    //         stockList[j].quantity = 0;
    //     }
    // }

    // var v = $('#switchOption2').val();

    // if(v == '1'){
    //     $('#stockList').bootstrapTable('destroy');
    //     $('#stockList').bootstrapTable({
    //         data: closingStockList,
    //         search:true,
    //         reinit: true,
    //         trimOnSearch:false,
    //         pagination:true
    //     })
    // }
    // else{
    //     $('#stockList').bootstrapTable('destroy');
    //     $('#stockList').bootstrapTable({
    //         data:stockList,
    //         search:true,
    //         reinit: true,
    //         trimOnSearch:false,
    //         pagination:true
    //     })
    // }

    // console.log(stockList)
    // $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    // $('.customInputSearchDiv').addClass('flex-row margin-20')
    // $('#reviewStock').css('display','none');
    // $('#placeNewOrder').css('display','block');
    // $('#reviewTableFooter').css('display','none');
}


function renderReviewCart(value,row){

    return '<div style="display:flex;flex-direction:row">' + '<button class="cartBtn" onclick="decrementReview(this)" value=review'+row.productID+'>-</button>' + '<input class="quantity" min="0" type="number" id=review'+row.productID+' value='+row.quantity+' onchange="handleReviewChange(this)" onkeyup="handleReviewChange(this)" onkeypress="return event.charCode >= 48"></input>' + '<button class="cartBtn" onclick="incrementReview(this)" value=review'+row.productID+'>+</button>' + '</div>';
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
    renderTotalData()
}


function deleteItem(value,row){

    return '<div style="cursor:pointer;" onclick="handleDelete(this)" id=delete'+row.productID+'> <img src = "../../assets/img/trash-gray.png"> </div>';
}

function handleDelete(element){
    const dialogOptions = {type: 'info', buttons: ['Cancel', 'OK'], message: 'Are you sure you want to delete?'}
    dialog.showMessageBox(dialogOptions, async i => {
        if(i){
            let productID = element.id;
            productID =  productID.substr(6,productID.length)  
            delete cartList[JSON.stringify(productID)];
            
            for(let i=0;i<stockList.length;i++)
            {
                if(productID == stockList[i].productID)
                {
                    stockList[i].quantity = 0;
                    unit = 0;
                    break;
                }
            }

            review()
        }
    })
}

function handleReviewChange(element){

    let productID = element.id;
    let ID = '#'+productID;
    let quantity;

    if(element.value){
         quantity = parseInt(element.value);
    }
    else{
        quantity = 0;
    }
    
    $(ID).val(quantity)
    
    productID = productID.substr(6,productID.length)

    if(quantity==0){
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
    renderTotalData()
    console.log(quantity,element.id)
    console.log(cartList)
}

async function placeOrder(type){

    if(disabled){
        console.log('disabled')
        return false;
    }
    else{
        disabled = true;
    }

    // $('#placeOrder').attr('disabled',true);

    console.log(type)
    console.log(cartList,'cartList')

    var isEmpty = true
    for (x in cartList){
        isEmpty = false
    }
    if(isEmpty){
        var message = 'Select Quantity, You can not place a zero quantity order!'
        isError(message)
        // $('#placeOrder').attr('disabled',false);
        disabled = false;
        return false;
    }

    placeOrderList = [],suggestedQty = 0,isDraft=0,k=0;

    if(type == 'draft'){
        isDraft = 1
    }

      
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

    var currentDate = moment().format('YYYY-MM-DD','Asia/Kolkata');
    console.log('currentDate',currentDate,'stockRequestDate',stockRequestDate)

    var renewStockNumber;

    if(currentDate > stockRequestDate){
        renewStockNumber = true;
    }
    else{
        renewStockNumber = false;
    }
    
    console.log('renewStockNumber',renewStockNumber)

    if(renewStockNumber){
        localStorage.setItem('stockRequestNumber',79);
        localStorage.setItem('stockRequestDate',currentDate)
    }

    var stockRequestNumber = localStorage.getItem('stockRequestNumber');
    stockRequestNumber++;

    console.log('stockRequestNumber',stockRequestNumber)

    if(stockRequestNumber == 90){
        dataInsert = false
        var message = 'You have reached to your daily order limit of 10, Please order tomorrow!'
        isError(message,reRenderLocation)
        return false
    }

    stockReference = parseInt(stockRequestNumber)+'SMMSSAPP'+partyCode+dateStr;
    localStorage.setItem('stockRequestNumber',stockRequestNumber);
    
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
                var requestingErrMsg='Error in Requesting order!'
                isError(requestingErrMsg,reRenderLocation)
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
