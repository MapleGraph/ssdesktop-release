const {dialog} = require('electron').remote;

var maxInventory=0;
var selectedProductData=[];
var selectedProductBatchData=[];
var reviewSelectedProductBatchData=[];
var cSelectedProductBatchData = [];
var cartData=[];
var filteredProductBatch=[];
var taxList = [];
var discountProductList = [];
var discountAppliedIDs = [];
var discountLevelList = [];
var discountDetails = [];
var discountClusters = [];

var totalItemSales = 0;
var totalUnits = 0;
var totalPrice = 0;
var totalDiscountPrice = 0;
var totalGrossSale = 0;
var totalTaxValue = 0;
var totalCashDiscount = 0
var cashDiscPercent = 0
var orderID;
var invoiceNo;
var orderTime;
var rounding = 0;
var grossSaleRounded = 0;

var partyCode ;
var customerID=0 ;
var customerData;
var customerInfo;
var statements = [];
var credits= [];
var adjustedPaymentList=[];
var selectedCustID = 0;
var mappedCustID = 0
var mappedCustName = ''
var filterPacksQuery = `HAVING SUM(A.inventory) > 0`
var notCounterSale = true;
var upcFactor = false;
var filteredFinalProductData = []
//var filtersApplied = false
var filteredFinalSchemeProdData = []

var sum = 0;
var cash = 0;
var creditNotesAdjusted = false;
var creditNotesDetailsForPDF = []

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='billingDashboard.html'
var errorBoxOpen = false;
var batchModalOpen = false
var noPrint = true
var checkReviewRender2= 0
var checkReviewRender = 0
var generateBillDisabled = false

var finalBrandData,finalCategoryData,finalProductData,combinedList,finalList;

$(document).ready(async()=>{
    await getMenu('Manual Billing')
    await backNavigation()
 
    $('.select2').select2();

    var str = window.location.search.split("=");
    var isMappedCust = str[1]
   if(isMappedCust){
    mappedCustData = await new Promise((resolve)=>{
        db.all(`SELECT * FROM customers WHERE isMappedToSS = 1`,(error,data)=>{
            if(error){
                isError(fetchingErrMsg)
            }
            else{
                resolve(data)
            }
        })
    })

    if(mappedCustData.length){
        notCounterSale = false
        await preSelectCust(mappedCustData)
        $('#generalTitle').css('display','none')
        $('#counterTitle').css('display','flex')
    }
    else{
        notCounterSale = true
        $('#generalTitle').css('display','flex')
        $('#counterTitle').css('display','none')
    }
   }

//    mappedCustID =str[1];
//    mappedCustName =str[2];

//    if(mappedCustID && mappedCustName ){
//        notCounterSale = 0
//        mappedCustName = mappedCustName.replace(/%20/g,' ')
//        await preSelectCust(mappedCustID)
//    }


    initiateMultiSelect()
})


$(document).on('keydown',function(e) {
    if(batchModalOpen){
        if(e.keyCode == 9) {
            e.preventDefault()
        }
    }
});

preSelectCust=async(mappedCustData)=>{
    console.log(mappedCustData,'mappedCustData')
    $('#select2-chosen-1').html(mappedCustData[0].firstName) 
    mappedCustData.map(n=>{
        customerName = n.firstName;
        customerValue = n.customerID;
        element = '<option value='+customerValue+'>'+customerName+'</option>'
        $('#customerList').append(element);
    })
    await populatePartyCode(mappedCustData[0].customerID)
    customerID = mappedCustData[0].customerID
    $('#customerList').val(customerID);
}

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}


initiateMultiSelect=()=>{

    $('#brands').multiselect('destroy');
    $('#brands').multiselect({
        enableCaseInsensitiveFiltering: true,
        includeSelectAllOption: true,
        trimOnSearch:false,
        maxHeight: 500,
        numberDisplayed: 1,
        maxwidth:150,
        dropUp: false,
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

    // $('.multiselect-container').css('visibility','collapse')

    // $('.customDropdownToggle').css({
    //     'margin-top': '0',
    //     'width': '100%',
    //     'height': '40px',
    //     'box-shadow': '0 1px 0 0 rgba(22, 29, 37, 0.05)',
    //     'border-radius': '4px',
    //     'border': 'solid 1px #acb3ba',
    //     'background': '#fff',
    //     'text-align': 'left'
    // })
}

function getData(){
    console.log(notCounterSale,'notCounterSale')

    db.all('SELECT *  FROM customers',function(err,rows){
        if(err){
            console.log(err);
    
                isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            customerData = rows;

            if(notCounterSale && customerData.length){
                for(let i=0;i<customerData.length;i++)
                {
                    customerName = customerData[i].firstName;
                    customerValue = customerData[i].customerID;
                    element = '<option value='+customerValue+'>'+customerName+'</option>'
                    $('#customerList').append(element);
                }
            }
            // $('#customerList').val(customerID);
        }
    })

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
        }
    })
    // getSchemesList()
     getTaxList()
}

populatePartyCode=async(custID)=>{
    $('#partyCode').empty();
    $('#select2-chosen-2').html("None Selected")
    $('#productList').bootstrapTable('destroy')
    $('#bottomBtns').css({"display":'none'}) 
    $('#topBtns').css({"display":'none'}) 
    $('#switchFilters').css('display','none')   
    selectedProductData = []
    cartData = []
    if(custID){
        //customerID = mappedCustID
        customerID = custID
        selectedCustID = custID
    }
    else{
        customerID = $('#customerList').val();
        selectedCustID = customerID
    }
    console.log(customerID)
    // SELECT * FROM customersPartyCode WHERE customerID = "${customerID}" AND isActive ='1'
    var query = `Select distinct (partyCode),salName from customersPartyCode where customerID = "${customerID}" GROUP BY partyCode`
    partyCodeData = await new Promise((resolve)=>{
        db.all(query,(error,data)=>{
            if(error){
                isError(fetchingErrMsg)
            }
            else{
                resolve(data)
            }
        })
    })

    console.log(partyCodeData,'partyCodeData')
    if(partyCodeData.length){
        partyCodeData = partyCodeData.filter(n=>n.salName)
        if(partyCodeData.length == 1){
            $('#select2-chosen-2').html(partyCodeData[0].partyCode) 
            $("#partyCode").html('<option value="0">None Selected </option>');
            partyCodeData.map(m=>{
                var partyCodeName = m.partyCode;
                var partyCodeValue = m.partyCode;
                element = '<option value='+partyCodeValue+'>'+partyCodeName+'</option>'
                $('#partyCode').append(element);    
            })
            partyCode = partyCodeData[0].partyCode
            $('#partyCode').val(partyCode);
        }
        else{
            $("#partyCode").html('<option value="0">None Selected </option>');
            partyCodeData.map(m=>{
                var partyCodeName = m.partyCode;
                var partyCodeValue = m.partyCode;
                element = '<option value='+partyCodeValue+'>'+partyCodeName+'</option>'
                $('#partyCode').append(element);
            })
        }
    }
    else{
        $("#partyCode").html('<option value="0">None Selected</option>');
    }
}

populateBrands=()=>{
    $('#brands').empty();
    var incomeHead = $('#incomeHead').val();

    db.all(`SELECT DISTINCT brandID,brandName FROM products WHERE incomeHead LIKE "${incomeHead}"`,function(err,row){
        if(err){
            console.log(err); 
                isError(fetchingErrMsg,reRenderLocation)
        }                
        else{
            brandsData = row;
            console.log(brandsData,'brandsData')
            if(brandsData && brandsData.length){
                // $("#brands").html('<option value="0"> All Brands</option>');
                brandsData.map(m=>{
                    brandNameData = m.brandName;
                    brandIdData = m.brandID;
                    element = '<option value='+brandIdData+'>'+brandNameData+'</option>'
                    $('#brands').append(element);
                })
            }
            else{
                // $("#brands").html('<option value="0"> All Brands</option>');
            }
            initiateMultiSelect()
         
        }
    })
}

getProducts= async()=>{
    if(errorBoxOpen){
        return false
    }
    customerID = $('#customerList').val();
    partyCode = $('#partyCode').val();
    var brandValue = $('#brands').val();
    var incomeHeadValue = $('#incomeHead').val()
    console.log(customerID,'customerID',partyCode,'partyCode',brandValue,'brandValue',incomeHeadValue,'incomeHeadValue')

    if(customerID=='0' || partyCode == '0'){
        var message ='Please select Customer and Party Code'
        //isError(message)
        errorBoxOpen = true
        var dialogOptions = {type: 'info', buttons: ['OK'], message: message}
        dialog.showMessageBox(dialogOptions, async i => {
            if(!i){
                errorBoxOpen = false   
            }
        })
        return false
    }
    
    csPacks = $('#switchOption1').val() == '1' ? true : false
    normPacks = $('#switchOption2').val() == '1' ? true : false

    if(customerID != selectedCustID){
        getFilteredProducts(csPacks,normPacks,incomeHeadValue,brandValue)
    }
    else{
        var filterQuery = ` WHERE A.sbomDesc != 'LSBOM-C'`
        var query = `SELECT DISTINCT A.productID, B.MRP, B.unitsPerCase,B.productName, B.lowStockAlertQuantity,B.incomeHead ,B.brandID, B.taxIDs, SUM(A.inventory) AS closingStock,C.turPerUnit,A.sbomDesc FROM batchProductVariants AS A INNER JOIN products AS B ON A.productID = B.productID  INNER JOIN storeRegion as C ON  A.serialNumber = C.sku ${filterQuery} GROUP BY A.productID`
        loader(1)

        finalProductData = await new Promise((resolve,reject)=>{
            db.all(query,(err,data)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log(data)
                    resolve(data)
                }
            });
        })

        finalProductData.map(m=>{
            m['quantityOrdered'] = 0;
            m['productValue'] = 0;
            m['productPrice'] = 0;
            m['discountValues'] = 0;
            m['taxes'] = [];
            m['isChild'] = false
        })
        // console.log(finalProductData,'finalProductData')
        // $('#productList').bootstrapTable('destroy')
        // $('#productList').bootstrapTable(
        //     {
        //         data:finalProductData,
        //         search:true,
        //         reinit: true,
                
        //         trimOnSearch:false,
        //         pagination:true
        //     }
        // );
        // loader(0)
        // $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
        // $('.customInputSearchDiv').addClass('flex-row margin-20')
        // $('#bottomBtns').css({"display":'flex'}) 
        // $('#topBtns').css({"display":'flex'}) 
        // $('#switchFilters').css('display','flex')
        selectedProductData=[];
        selectedProductBatchData = [];
        cartData = [];  
        await getSchemesList()
        await getSchemeProducts()
        await getFilteredProducts(csPacks,normPacks,incomeHeadValue,brandValue)
    }
    selectedCustID = 0
}

getSchemeProducts=async()=>{
    console.log(customerID,'customerID')
    schemeProductsData = await new Promise((resolve,reject)=>{
        db.all(`SELECT B.discountID , c.discountProductList FROM discountCustomerMap AS A INNER JOIN discountMaster AS B ON A.discountID = B.discountID INNER JOIN discountProductMap AS C ON B.discountID = C.discountID WHERE A.customerID = ${customerID} AND B.activityClassification='STPR' AND B.isCashDiscount = 0`,(err,data)=>{
            if(err){
                console.log(err)
            }
            else{
                console.log(data)
                resolve(data)
            }
        });
    })
    console.log(schemeProductsData,'schemeProductsData')
    var allProdArray = []
    schemeProductsData.map(m=>{
        var prodArry =  (m.discountProductList).split(",")
        allProdArray.push(...prodArry)
    })
    console.log(allProdArray,'allProdArray')

    filteredFinalSchemeProdData = finalProductData.filter(o2 => allProdArray.some(o1 => o1== o2.productID));
    
    console.log(filteredFinalSchemeProdData,'filteredFinalSchemeProdData')
    
    finalProductData.map(n=>{
        filteredFinalSchemeProdData.map(l=>{
            if(l.productID==n.productID){
                n['stprSchemeApplied'] = true
            }
        })
    })
}

getFilteredProducts=(csPacks,normPacks,incomeHeadValue,brandValue)=>{
    console.log(csPacks,normPacks,incomeHeadValue,brandValue)
    loader(1)
    filteredFinalProductData = []
    if(incomeHeadValue == '0' && (brandValue =="0" || brandValue.length == '0')){
        filteredFinalProductData = finalProductData
    }
    if(incomeHeadValue != '0' && (brandValue =="0" || brandValue.length == '0')){
        filteredFinalProductData = finalProductData.filter(b=>b.incomeHead==incomeHeadValue)
    }
    else if(incomeHeadValue != '0' && (brandValue !="0" || brandValue.length)){
        filteredFinalProductData = finalProductData.filter(b=>brandValue.indexOf(`${b.brandID}`) != -1)

    }
    if(csPacks && normPacks){
        filteredFinalProductData= filteredFinalProductData.filter(a=>a.closingStock>0 && a.lowStockAlertQuantity>0)
    }
    else if(csPacks && !normPacks){
        filteredFinalProductData= filteredFinalProductData.filter(a=>a.closingStock>0)
    }
    else if(!csPacks && normPacks){
        filteredFinalProductData= filteredFinalProductData.filter(a=>a.lowStockAlertQuantity>0)
    }
    else if(!csPacks && !normPacks){
        filteredFinalProductData = filteredFinalProductData
    }
  

    // console.log(filteredFinalProductData,'filteredFinalProductData')
    // filteredFinalSchemeProdData2 = filteredFinalProductData.filter(o2 => filteredFinalSchemeProdData.some(o1 => o1.productID != o2.productID));

    // console.log(filteredFinalSchemeProdData2,'filteredFinalSchemeProdData2')

  
    filteredFinalProductData.sort((a,b)=>(b.quantityOrdered) - (a.quantityOrdered))

    console.log(filteredFinalProductData,'filteredFinalProductData')

    $('#productList').bootstrapTable('destroy')
    $('#productList').bootstrapTable(
        {
            data:filteredFinalProductData,
            search:true,
            reinit: true,
            trimOnSearch:false,
            pagination:true
        }
    );
    loader(0)
    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    $('.customInputSearchDiv').addClass('flex-row margin-20')
    $('#bottomBtns').css({"display":'flex'}) 
    $('#topBtns').css({"display":'flex'}) 
    $('#switchFilters').css('display','flex')
}

// getClosingStockPacks=()=>{
//     var v = $('#switchOption1').val()
//     if(v=='1'){
//         console.log(v)
//         getProducts('normPacks')
//         $('#switchOption1').val('0')
//         $('#switchOption2').val('1')
//         $('#switchOption1').attr('unchecked',true).attr('checked',false)
//         $('#switchOption2').attr('checked',true).attr('unchecked',false)
//     }
//     else{
//         console.log(v)
//         $('#switchOption1').val('1')
//         getProducts('allPacks')
//     }
    
// }

// getNormPacks=()=>{ 
//     var v = $('#switchOption2').val()
//     if(v=='1'){
//         console.log(v)
//         getProducts('csPacks')
//         $('#switchOption2').val('0')
//         $('#switchOption1').val('1')
//         $('#switchOption2').attr('unchecked',true).attr('checked',false)
//         $('#switchOption1').attr('checked',true).attr('unchecked',false)
//     }
//     else{
//         console.log(v)
//         $('#switchOption2').val('1')
//         getProducts('allPacks')
//     }
// }


getClosingStockPacks=()=>{
    // var brandValue = $('#brands').val();
    // var incomeHeadValue = $('#incomeHead').val()

    var v1 = $('#switchOption1').val()
    if(v1=='1'){
       $('#switchOption1').val('0')
       $('#switchOption1').attr('unchecked',true).attr('checked',false)
       getProducts()
    //    var v2 = $('#switchOption2').val()
    //    v1 = $('#switchOption1').val()
    //    console.log(v1,v2)

    //    if(v2=='1'){
    //     // getFilteredProducts(false,true,incomeHeadValue,brandValue)
    //     //filtersApplied = true
    //    }
    //    else{
    //     // getFilteredProducts(false,false,incomeHeadValue,brandValue)
    //     //filtersApplied = false
    //    }
    }
    else{
        $('#switchOption1').val('1')
        $('#switchOption1').attr('unchecked',false).attr('checked',true)
        getProducts()
        // var v2 = $('#switchOption2').val()
        // v1 = $('#switchOption1').val()
        // console.log(v1,v2)

        // if(v2=='1'){
        // //  getFilteredProducts(true,true,incomeHeadValue,brandValue)
        //  //filtersApplied = true
        // }
        // else{
        // //  getFilteredProducts(true,false,incomeHeadValue,brandValue)
        //  //filtersApplied = true

        // }
    }
    
}

getNormPacks=()=>{ 
    // var brandValue = $('#brands').val();
    // var incomeHeadValue = $('#incomeHead').val()

    var v2 = $('#switchOption2').val()
    if(v2=='1'){
        $('#switchOption2').val('0')
        $('#switchOption2').attr('unchecked',true).attr('checked',false)
        getProducts()
        // var v1 = $('#switchOption1').val()
        // v2 = $('#switchOption2').val()
        // console.log(v1,v2)

        // if(v1=='1'){

        // //  getFilteredProducts(true,false,incomeHeadValue,brandValue)
        //  //filtersApplied = true
        // }
        // else{

        // //  getFilteredProducts(false,false,incomeHeadValue,brandValue)
        //  //filtersApplied = false
        // }
    }
    else{
        $('#switchOption2').val('1')
        $('#switchOption2').attr('unchecked',false).attr('checked',true)
        getProducts()
        // var v1 = $('#switchOption1').val()
        // v2 = $('#switchOption2').val()
        // console.log(v1,v2)

        // if(v1=='1'){

        //     // getFilteredProducts(true,true,incomeHeadValue,brandValue)
        //     //filtersApplied = true
        // }
        // else{
        //     // getFilteredProducts(false,true,incomeHeadValue,brandValue)
        //     //filtersApplied = true
        // }
    }
}

applyCLD=()=>{
    var v3 = $('#switchOption3').val()
    if(v3=='1'){
        upcFactor = false
        $('#switchOption3').val('0')
        $('#switchOption3').attr('unchecked',true).attr('checked',false)
    }
    else{
        upcFactor = true
        $('#switchOption3').val('1')
        $('#switchOption3').attr('unchecked',false).attr('checked',true)
    }
}


getTaxList=()=>{
    db.all(`SELECT * FROM taxes`,(err,data)=>{
        if(err){
            console.log(err);
                isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            taxList = data
        }
    })   
}

getSchemesList=()=>{
    console.log(customerID,'customerID')
    db.all(`SELECT discountID FROM discountCustomerMap WHERE customerID = ${customerID}`,(err,data)=>{
        if(err){
            console.log(err);
                isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            discountAppliedIDs = data
        }
    }) 
    db.all(`SELECT * FROM discountProductMap`,(err,data)=>{
        if(err){
            console.log(err);
                isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            discountProductList = data;
        }
    }) 
    db.all(`SELECT * FROM discountLevel`,(err,data)=>{
        if(err){
            console.log(err);
                isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            discountLevelList = data
        }
    })
    db.all(`SELECT * FROM discountClusters`,(err,data)=>{
        if(err){
            console.log(err);
                isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            discountClusters = data
            console.log(discountClusters,'discountClusters')
        }
    })
    db.all(`SELECT * FROM discountMaster`,(err,data)=>{
        if(err){
            console.log(err);
                isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            discountDetails = data
        }
    })
}


renderProdName=(value,row)=>{

    if(row.stprSchemeApplied){
        return `<span type='text' >${row.productName}<img src="../../assets/img/percentIcon.png" class='stprIcon' /></span>`;
    }
    else{
        return `<span type='text' >${row.productName}</span>`;
    }
}

renderSelectStockBtn=(value,row)=>{
    if(row.quantityOrdered){
        return `<button type = "button" id="stockBtn${row.productID}" onclick="showBatches(${row.productID})" class ="btnWhite">Select PKM</button>`
    }
    else{
        return `<button type = "button" id="stockBtn${row.productID}" onclick="showBatches(${row.productID})" class ="btnWhite inactiveDiv">Select PKM</button>`
    }
}

renderUnit=(value,row)=>{
    if(row.quantityOrdered){
        return `<div  class=" flex-row activeDiv" style="justify-content:flex-end"  id="prodDiv${row.productID}">
        <button class='btn btn-primary btn-xs quant-chng-btn' onclick="decreaseQuant(${row.productID},'prod')"  id="prod${row.productID}dec" >-</button>
        <input class='quantityInput' type="number" id="prod${row.productID}input" value="${row.quantityOrdered}" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${row.productID},'prod')" onclick="changeQuantity(${row.productID},'prod')"></input>
        <button class='btn btn-primary btn-xs quant-chng-btn'  onclick="increaseQuant(${row.productID},'prod')" id="prod${row.productID}inc">+</button>
        </div>`;
    }
    else{
        return `<div   class=" flex-row inactiveDiv" style="justify-content:flex-end" id="prodDiv${row.productID}">
            <button class='btn btn-primary btn-xs quant-chng-btn' onclick="decreaseQuant(${row.productID},'prod')"  id="prod${row.productID}dec" >-</button>
            <input class='quantityInput' type="number" id="prod${row.productID}input" value="${row.quantityOrdered}" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${row.productID},'prod')" onclick="changeQuantity(${row.productID},'prod')"></input>
            <button class='btn btn-primary btn-xs quant-chng-btn' onclick="increaseQuant(${row.productID},'prod')" id="prod${row.productID}inc">+</button>
        </div>`;
    }
}

renderPrice=(value,row)=>{
    return `<div  id="priceDiv${row.productID}">${row.productPrice}</div>`;
}

renderProdCheck=(value,row)=>{
    var id=row.productID;
    if(row.quantityOrdered){
        // checkDisabledElement('checked',id,row.quantityOrdered,'prod',row)
        return `<input type="checkbox" checked id="checkProd${row.productID}" data-string="${row}" onclick="prodSelect(${row.productID},${row.closingStock},this)" name="checkID">`;
    }
    else{
        // checkDisabledElement('unchecked',id,0,'prod',row,row.isChild)
        return `<input type="checkbox" id="checkProd${row.productID}"  data="${row}" onclick="prodSelect(${row.productID},${row.closingStock},this)" name="checkID">`;
    }
}

prodSelect=(id,closingStock,event)=>{
    if(errorBoxOpen){
        return false
    }
    if(closingStock<=0){
        $(`#checkProd${id}`).prop('checked', false);
        var message = `You can not select zero closing stock pack!`
        //isError('message')
        errorBoxOpen = true
        var dialogOptions = {type: 'info', buttons: ['OK'], message: message}
        dialog.showMessageBox(dialogOptions, async i => {
            if(!i){
                errorBoxOpen = false   
            }
        })
        return false
    }
    var checkStatus = event.checked
    if(checkStatus){

        row = finalProductData.find(m=>m.productID== id)
        checkDisabledElement('checked',id,0,'prod',row,)
        console.log()
    }
    else{
        checkDisabledElement('unchecked',id,0,'prod',row)
    }
}

checkDisabledElement=(status,id,quantityOrdered,type,row,isChild)=>{
    var inputID = '#'+type+id+'input';
    if(type == "prod"){
        if(status == "checked"){
            $("#prodDiv"+id).addClass("activeDiv");
            $("#prodDiv"+id).removeClass("inactiveDiv");
            $("#stockBtn"+id).addClass("activeDiv");
            $("#stockBtn"+id).removeClass("inactiveDiv");
            if(quantityOrdered<=0){
                $('#'+type+id+'dec').attr("disabled",true);
                $('#'+type+id+'inc').attr("disabled",false);
            }
            $(inputID).val(quantityOrdered);
            if(row){
          
               var checkArr =  selectedProductData.filter(m=>m.productID == row.productID && !row.isChild)
               if(!checkArr.length){  
                   if(row && !row.isChild){
                       row.quantityOrdered =quantityOrdered
                       row.currentInventory = row.closingStock - quantityOrdered;
                       selectedProductData.push(row)
                    //    selectedProductData.map(m=> {
                    //         if(m.productID == id){
                    //             m.quantityOrdered = quantityOrdered;
                    //             m.currentInventory = m.closingStock - quantityOrdered;
                    //         }
                    //     })
                   }            
                   productBatchData(id,quantityOrdered,type)
               }
            }
        }
        else if(status == "unchecked" ){
            $("#prodDiv"+id).removeClass("activeDiv");
            $("#prodDiv"+id).addClass("inactiveDiv");
            $("#stockBtn"+id).addClass("inactiveDiv");
            $("#stockBtn"+id).removeClass("activeDiv");
            $('#priceDiv'+id).html('0')
            $(inputID).val(0);
            if(!isChild){
                handleCartChange(selectedProductBatchData,id,quantityOrdered,type,'remove')
            }
        }
    }
    else if(type== 'batch'){
        if(status == "checked"){
            $("#batchDiv"+id).addClass("activeDiv");
            $("#batchDiv"+id).removeClass("inactiveDiv");
            if(quantityOrdered<=0){
                $('#'+type+id+'dec').attr("disabled",true);
                $('#'+type+id+'inc').attr("disabled",false);
            }
            $(inputID).val(quantityOrdered);
            if(cSelectedProductBatchData.length){
                var batchObj = cSelectedProductBatchData.find(m=>m.batchVariantID ==id)
                batchObj['currentInventory'] =  batchObj.inventory - quantityOrdered;
                batchObj['quantityOrdered'] = quantityOrdered;
                batchObj['batchPrice'] = parseFloat((batchObj.turPerUnit*quantityOrdered).toFixed(3))
            }
        }
        else if(status == "unchecked"){
            $("#batchDiv"+id).removeClass("activeDiv");
            $("#batchDiv"+id).addClass("inactiveDiv");
            if(cSelectedProductBatchData.length){
                var batchObj = cSelectedProductBatchData.find(m=>m.batchVariantID ==id)
                batchObj['currentInventory'] =  batchObj.inventory
                batchObj['quantityOrdered'] = 0
                batchObj['batchPrice'] = 0
            }
            $(inputID).val(0);
        }
    }
    else{
        prodID = 0;
        selectedProductBatchData.map(m=>{
            if(m.batchVariantID==id){
                m['currentInventory'] =  m.inventory
                m['quantityOrdered'] = 0
                m['batchPrice'] = 0
                prodID = m.productID;
            }
            return m; 
        })
        reviewSelectedProductBatchData = reviewSelectedProductBatchData.filter(a=>a.batchVariantID != id ) 
        handleCartChange(selectedProductBatchData,prodID,0,'batch')
    }
}


productBatchData=(productID,quantityOrdered,type)=>{
    var batchQuery = `SELECT batchProductVariants.*,storeRegion.skuWeight AS weight,storeRegion.skuWeightUnit AS weightUnit,storeRegion.turPerUnit, storeRegion.mrpPerUnit AS MRP , storeRegion.cpLinkage,storeRegion.parentSkuQty,storeRegion.childSkuQty FROM batchProductVariants INNER JOIN storeRegion ON batchProductVariants.batchVarRefID = storeRegion.batchVariantID WHERE batchProductVariants.inventory > 0 AND batchProductVariants.productID = ${productID} AND batchProductVariants.sbomDesc != 'LSBOM-C'`
    console.log(batchQuery,'batchQuery')
    db.all(batchQuery,function(err,rows){
        if(err){
            console.log(err);
                isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            console.log(rows,'batchrows')
            rows.map(m=>{
                var pkm = moment(m.manufacturingDate).format("MMM, YYYY");
                m['discountValues'] = 0
                m['btprDiscountValues'] = 0
                m['stprDiscountValues'] = 0
                m['stprCashDiscountValues'] = 0
                m['discounts'] = []
                m['pkm']=pkm
                m['quantityOrdered'] = 0
                m['childQuantityOrdered'] = 0
                m['productValue'] = 0
                m['batchPrice'] = 0
                m['taxValue']=0
                m['totalTaxValue']=0
                m['totalTaxPercentage']=0
            })
            // rows.map(m=>{
            //     selectedProductBatchData = selectedProductBatchData.filter(a=>a.batchVariantID!=m.batchVariantID)
            // })
            selectedProductBatchData.push(...rows)
            selectedProductBatchData.sort((a,b)=>new Date(a.manufacturingDate) - new Date(b.manufacturingDate))

            // return false
            //assignBatchToCart(productID,quantityOrdered,type)
            //handleCartChange(selectedProductBatchData,productID,quantityOrdered,type);
        }
    })
}

showBatches=(productID)=>{
    if(selectedProductBatchData.length){
        filteredProductBatch = selectedProductBatchData.filter(m=>m.productID == productID && m.sbomDesc!='LSBOM-C')
        $('#batchVariantListTable').bootstrapTable('destroy');
        $('#batchVariantListTable').bootstrapTable({
            data:filteredProductBatch,
            search:false,
            pagination:false,
            trimOnSearch:false,
            reinit: true,
        });
        // $('#roleTitle1').text(filteredProductBatch[0].productName)
        $("#myModal").modal('show');
        batchModalOpen = true
        $("#prodId").val(productID);
        cSelectedProductBatchData = JSON.parse(JSON.stringify(selectedProductBatchData));
    }
}

renderBatchUnit=(value,row)=>{
    if(row.quantityOrdered){
        return `<div class='flex-row activeDiv' id="batchDiv${row.batchVariantID}"  style="justify-content:flex-start">
        <button class='btn btn-primary btn-xs quant-chng-btn' id="batch${row.batchVariantID}dec" onclick="decreaseQuant(${row.batchVariantID},'batch')" value="${row.batchVariantID}"> - </button>
        <input value="${row.quantityOrdered}" min="0" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${row.batchVariantID},'batch')" onclick="changeQuantity(${row.batchVariantID},'batch')"   type='number' class='quantityInput' id="batch${row.batchVariantID}input" name='inventory' />
        <button class='btn btn-primary btn-xs quant-chng-btn'  id="batch${row.batchVariantID}inc"  onclick="increaseQuant(${row.batchVariantID},'batch')" value="${row.batchVariantID}"> + </button>
        </div>`
    }else{
        return `<div class='flex-row inactiveDiv' id="batchDiv${row.batchVariantID}"  style="justify-content:flex-start">
        <button  class='btn btn-primary btn-xs quant-chng-btn' id="batch${row.batchVariantID}dec" onclick="decreaseQuant(${row.batchVariantID},'batch')" value="${row.batchVariantID}"> - </button>
        <input value="${row.quantityOrdered}" min="0" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${row.batchVariantID},'batch')" onclick="changeQuantity(${row.batchVariantID},'batch')"   type='number' class='quantityInput' id="batch${row.batchVariantID}input" name='inventory' />
        <button class='btn btn-primary btn-xs quant-chng-btn'  id="batch${row.batchVariantID}inc"  onclick="increaseQuant(${row.batchVariantID},'batch')" value="${row.batchVariantID}"> + </button>
        </div>`
    }
}

renderBatchCheck=(value,row)=>{	
    var id=row.batchVariantID;
    if(row.quantityOrdered){
        checkDisabledElement('checked',id,row.quantityOrdered,'batch')
        return `<input type="checkbox" checked id="checkBatch${row.batchVariantID}" onclick="batchVarientSelect(${row.batchVariantID},this)" name="checkID" value="${row.batchVariantID}" style="margin-right:8px">`+ row.pkm;
    }
    else{
        checkDisabledElement('unchecked',id,0,'batch')
        return `<input type="checkbox" id="checkBatch${row.batchVariantID}" onclick="batchVarientSelect(${row.batchVariantID},this)" name="checkID" value="${row.batchVariantID}" style="margin-right:8px">`+ row.pkm;
    }
}

batchVarientSelect=(id,event)=>{
    var checkStatus = event.checked
    if(checkStatus){
        checkDisabledElement('checked',id,0,'batch')
    }
    else{
        checkDisabledElement('unchecked',id,0,'batch')
    }
}

changeQuantity=(rowID,type)=>{
    var obj={};
    var productID;

    inBtnID = '#'+type+rowID+'inc';
    deBtnID = '#'+type+rowID+'dec';
    inputID = '#'+type+rowID+'input';
    console.log(inputID,'inputID1',rowID,type)

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
    else if(type=='reviewBatch'){
        var batchObj = selectedProductBatchData.find(m=>m.batchVariantID ==rowID)
        maxInventory =  batchObj.inventory
        obj = batchObj;
        productID=batchObj.productID;
    }
    //inputID = '#'+rowID;

    var currentValue = parseInt($(inputID).val());

    if(currentValue==0){
        $(inputID).val('');
    }

    if(currentValue>maxInventory){
        $(inputID).val(maxInventory);
        currentValue=maxInventory;
        obj['quantityOrdered']=maxInventory;
        obj['currentInventory']=0;
        if(type!='prod'){
            obj['batchPrice'] = parseFloat((obj.turPerUnit*maxInventory).toFixed(3));									
        }									
        $(inBtnID).attr("disabled", true);
        if(type != "batch"){
            //assignBatchToCart(productID,currentValue,type);
            handleCartChange(selectedProductBatchData,productID,currentValue,type);
        }
    }

    else if(currentValue < 0){
        $(inputID).val(0);
        currentValue=0;
        obj['quantityOrdered']=0;
        obj['currentInventory']=maxInventory;	
        if(type!='prod'){
            obj['batchPrice'] = parseFloat((obj.turPerUnit).toFixed(3))	;;																	
        }								
        $(deBtnID).attr("disabled", true);
        if(type != "batch"){
            handleCartChange(selectedProductBatchData,productID,currentValue,type);
           // assignBatchToCart(productID,currentValue,type);
        }
    }
    else{
        obj['quantityOrdered']=currentValue;
        obj['currentInventory']=maxInventory - currentValue;
        if(type!='prod'){
            obj['batchPrice'] = parseFloat((obj.turPerUnit*currentValue).toFixed(3))																		
        }									
        $(deBtnID).attr("disabled", false);
        $(inBtnID).attr("disabled", false);
        if(currentValue==maxInventory){
            $(inBtnID).attr("disabled", true);
        }
        if(currentValue == 0){
            $(deBtnID).attr("disabled",true);									
        }
        
        // let checkSelectProdData = JSON.parse(JSON.stringify(selectedProductData));
        // let checkSelectedProductBatchData = JSON.parse(JSON.stringify(selectedProductBatchData));
        // console.log(checkSelectProdData,checkSelectedProductBatchData,'on change quantity')
        
        if(type != "batch"){
            handleCartChange(selectedProductBatchData,productID,currentValue,type);
            //assignBatchToCart(productID,currentValue,type);
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
            obj['quantityOrdered']=0;
            if(type!='prod'){
                obj['batchPrice'] = parseFloat((obj.turPerUnit).toFixed(3))										
            }
            $(deBtnID).attr("disabled", true);
            if(type != "batch"){
                handleCartChange(selectedProductBatchData,productID,currentValue,type);
                //assignBatchToCart(productID,currentValue,type);
            } 
        }

        // if(!currentValue){
        //     $(inputID).val(0);
        //     currentValue=0;
        //     obj['currentInventory']=maxInventory;
        //     obj['quantityOrdered']=0;
        //     if(type!='prod'){
        //         obj['batchPrice'] = parseFloat((obj.turPerUnit).toFixed(3))										
        //     }
        //     $(deBtnID).attr("disabled", true);
        //     if(type != "batch"){
        //         handleCartChange(selectedProductBatchData,productID,currentValue,type);
        //         //assignBatchToCart(productID,currentValue,type);
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
    else if(type=='reviewBatch'){
        var batchObj = selectedProductBatchData.find(m=>m.batchVariantID ==rowID)
        maxInventory =  batchObj.inventory
        obj = batchObj;
        productID=batchObj.productID;
    }
    //inputID = '#'+rowID;
    var currentValue = $(inputID).val();
    $(deBtnID).attr("disabled",false);									
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

        obj['quantityOrdered']=currentValue;	
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
    else if(type=='reviewBatch'){
        var batchObj = selectedProductBatchData.find(m=>m.batchVariantID ==rowID)
        maxInventory =  batchObj.inventory
        obj = batchObj;
        productID=batchObj.productID;
    }
   // inputID = '#'+rowID;
    var currentValue = $(inputID).val();
    $(inBtnID).attr("disabled",false);	

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
        obj['quantityOrdered']=currentValue;
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

saveBatchModal=async()=>{
    var prodID = $('#prodId').val();
    $('#myModal').modal('hide');
    //selectedProductBatchData = cSelectedProductBatchData
    //assignBatchToCart(prodID,'','batch')
    await handleCartChange(cSelectedProductBatchData,prodID,'','batch');
    batchModalOpen = false
    filteredProductBatch=[];
    cSelectedProductBatchData = [];
} 

// closeBatchModal=()=>{
//     $('#myModal').modal('hide');
//     batchModalOpen = false
//     filteredProductBatch = [];
//     cSelectedProductBatchData = [];
// } 

$("#myModal").on("hidden.bs.modal", function () {
    batchModalOpen = false
    filteredProductBatch = [];
    cSelectedProductBatchData = [];
});

proceedCart=()=>{
    if(errorBoxOpen){
        return false
    }
    checkReviewRender2= 0
    checkReviewRender = 0
    partyCode = $('#partyCode').val();
    console.log(partyCode,'partyCode',customerID,'customerID')
    reviewSelectedProductBatchData = []
    filteredSelectedProductData = []

    reviewSelectedProductBatchData = selectedProductBatchData

    filteredSelectedProductData = selectedProductData.filter(m=>m.quantityOrdered>0 || m.childQuantityOrdered>0) 
    
    console.log(reviewSelectedProductBatchData,filteredSelectedProductData)

    if(partyCode=='0'){
        var message = 'Please select Party Code!'
        //isError(message)
        errorBoxOpen = true
        var dialogOptions = {type: 'info', buttons: ['OK'], message: message}
        dialog.showMessageBox(dialogOptions, async i => {
            if(!i){
                errorBoxOpen = false   
            }
        })
        return false
    }

    if(cartData.length){
        $('#billingCart').css('display','none');
        $('#reviewBillingCart').css({'display':'flex', 'flex-direction': 'column'});
        $('#reviewTableFooter').css('display','flex');
        $('#reviewProductList').bootstrapTable('destroy');
        $('#reviewProductList').bootstrapTable(
            {data:filteredSelectedProductData,
            search:true,
            reinit: true,
            pagination:false,
            trimOnSearch:false,
        });
        $('.customInputSearchDiv').css('display','none');
        $('.discounted').css('color','#ba1800')
    }
    else{
        var message = 'Please select stock!'
        isError(message)
    }

}

function rowAttributes(row,index){
    return {id:'row'+row.productID}
}

renderActionButton=(value,row)=>{
    if(row.sbomDesc=='LSBOM-C' || row.childQuantityOrdered>0 || row.isChild){
        return `<img class="inactiveDiv" src = "../../assets/img/trash-gray.png">`
    }
    else{
        return `<img onclick="deleteProduct(${row.productID},'row')" src = "../../assets/img/trash-gray.png">`
    }
}

deleteProduct=(productID,type,id)=>{
    if(errorBoxOpen){
        return false
    }
    errorBoxOpen = true
    const dialogOptions = {type: 'info', buttons: ['Cancel', 'OK'], message: 'Are you sure you want to delete?'}
    dialog.showMessageBox(dialogOptions, async i => {
        errorBoxOpen = false  
        if(i){
            if(type=='row'){
                $('#row'+productID).remove()
                $('.rowBatch'+productID).closest('.detail-view').remove();
                $('.rowBatch'+productID).remove();
                $('#stockBtn'+productID).attr("disabled", true);
                $("#prodDiv"+productID).removeClass("activeDiv");
                $("#prodDiv"+productID).addClass("inactiveDiv");
                $('#prod'+productID+'input').val(0);
                //assignBatchToCart(productID,0,'prod','remove');
                handleCartChange(selectedProductBatchData,productID,0,'prod','remove');
            }
            else{
                var arr=[]
                checkDisabledElement('unchecked',id,0,'reviewBatch')
                //batchVarientSelect(id,false)
                arr = cartData.filter(m=>m.productID == productID)
                if(arr.length){
                    $('#rowBatch'+id).remove()
                }
                else{
                    $('#row'+productID).remove()
                    $('.rowBatch'+productID).closest('.detail-view').remove();
                    $('.rowBatch'+productID).remove();
                    //assignBatchToCart(productID,0,'prod','remove');
                    handleCartChange(selectedProductBatchData,productID,0,'prod','remove');
                }
            }
            var checkEmpty = selectedProductData.filter(a=>a.quantityOrdered>0)
            if(checkEmpty == 0){
                var dialogOptions = {type: 'info', buttons: ['OK'], message: `Cart is empty!`}
                dialog.showMessageBox(dialogOptions, async i => {
                    if(!i){
                        back()
                    }
                })
            }
        }
    })
}

function detailFormatter(index, row) {
    var html = []
    var expendedCartData = reviewSelectedProductBatchData.filter(m=>m.productID == row.productID)
    html.push(
        `<tr style='padding:8px 0; border:none!important;display:flex;align-items:center;'>
            <th style='width:5%'>S.No.</th>    
            <th style='width:10%'>PKM</th>
            <th style='width:10%'>SKU7</th>
            <th style='width:8%'>TUR</th>
            <th style='width:8%'>MRP</th>
            <th style='width:12%'>Total Tax %</th>
            <th style='width:12%'>Total Tax Amount</th>
            <th style='width:10%'>Discount</th>
            <th style='width:15%'>Units</th>
            <th style='width:10%'>Net Amount</th>
            <th style='width:5%'></th>
        </tr>`
        )
        expendedCartData.map((m,i)=>{
            m['SNo'] = ++i;
            if(m.isChild){
                html.push(
                `<tr class="rowBatch${m.productID} inactiveDiv" id="rowBatch${m.batchVariantID}" style='padding:8px 0; border:none!important;display:flex;align-items:center;'>
                    <td style='width:5%'>${m.SNo}</td>
                    <td style='width:10%' >${m.pkm}</td>
                    <td style='width:10%' >${m.serialNumber}</td>
                    <td  style='width:8%'>${m.turPerUnit}</td>
                    <td  style='width:8%'>${m.MRP}</td>
                    <td  style='width:12%'>${m.totalTaxPercentage}</td>
                    <td   id="reviewBatchTaxDiv${m.batchVariantID}" style='width:12%'>${m.taxValue}</td>
                    <td id="reviewBatchDiscountDiv${m.batchVariantID}" style=" width:10% ;color:#ba1800">${m.discountValues}</td>
                    <td style='width:15%'>
                        <div class='flex-row' id="batchDiv${m.batchVariantID}" >
                            <button disabled class='btn btn-primary btn-xs quant-chng-btn' id="reviewBatch${m.batchVariantID}dec" onclick="decreaseQuant(${m.batchVariantID},'reviewBatch')"> - </button>
                                <input value="${m.childQuantityOrdered}" min="0" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${m.batchVariantID},'reviewBatch')" onclick="changeQuantity(${m.batchVariantID},'reviewBatch')"  type='number' class='quantityInput' id="reviewBatch${m.batchVariantID}input" name='inventory' style='background:rgba(229, 230, 230, 0.25)' />
                            <button class='btn btn-primary btn-xs quant-chng-btn'  id="reviewBatch${m.batchVariantID}inc"  onclick="increaseQuant(${m.batchVariantID},'reviewBatch')"> + </button>
                        </div>
                    </td>
                    <td id="reviewBatchPriceDiv${m.batchVariantID}" style='width:10%' >${(m.productValue).toFixed(2)}</td>
                    <td style='width:5%' ><img onclick="deleteProduct(${m.productID},'batch',${m.batchVariantID})" src = "../../assets/img/trash-gray.png"></td>
                </tr>`)
            }
            else{
                if(m.quantityOrdered<=0){
                    html.push(
                    `<tr class="rowBatch${m.productID}" id="rowBatch${m.batchVariantID}" style='padding:8px 0; border:none!important;display:flex;align-items:center;'>
                        <td style='width:5%'>${m.SNo}</td>
                        <td style='width:10%' >${m.pkm}</td>
                        <td style='width:10%' >${m.serialNumber}</td>
                        <td  style='width:8%'>${m.turPerUnit}</td>
                        <td  style='width:8%'>${m.MRP}</td>
                        <td  style='width:12%'>${m.totalTaxPercentage}</td>
                        <td   id="reviewBatchTaxDiv${m.batchVariantID}" style='width:12%'>${m.taxValue}</td>
                        <td id="reviewBatchDiscountDiv${m.batchVariantID}" style=" width:10% ;color:#ba1800">${m.discountValues}</td>
                        <td style='width:15%'>
                            <div class='flex-row' id="batchDiv${m.batchVariantID}" >
                                <button disabled class='btn btn-primary btn-xs quant-chng-btn' id="reviewBatch${m.batchVariantID}dec" onclick="decreaseQuant(${m.batchVariantID},'reviewBatch')"> - </button>
                                    <input value="${m.quantityOrdered}" min="0" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${m.batchVariantID},'reviewBatch')" onclick="changeQuantity(${m.batchVariantID},'reviewBatch')"  type='number' class='quantityInput' id="reviewBatch${m.batchVariantID}input" name='inventory' style='background:rgba(229, 230, 230, 0.25)' />
                                <button class='btn btn-primary btn-xs quant-chng-btn'  id="reviewBatch${m.batchVariantID}inc"  onclick="increaseQuant(${m.batchVariantID},'reviewBatch')"> + </button>
                            </div>
                        </td>
                        <td id="reviewBatchPriceDiv${m.batchVariantID}" style='width:10%' >${(m.productValue).toFixed(2)}</td>
                        <td style='width:5%' ><img onclick="deleteProduct(${m.productID},'batch',${m.batchVariantID})" src = "../../assets/img/trash-gray.png"></td>
                    </tr>`)
                }
                else{
                    html.push(
                    `<tr class="rowBatch${m.productID}" id="rowBatch${m.batchVariantID}" style='padding:8px 0; border:none!important;display:flex;align-items:center;'>
                        <td style='width:5%'>${m.SNo}</td>
                        <td style='width:10%' >${m.pkm}</td>
                        <td style='width:10%' >${m.serialNumber}</td>
                        <td  style='width:8%'>${m.turPerUnit}</td>
                        <td  style='width:8%'>${m.MRP}</td>
                        <td  style='width:12%'>${m.totalTaxPercentage}</td>
                        <td   id="reviewBatchTaxDiv${m.batchVariantID}" style='width:12%'>${m.taxValue}</td>
                        <td id="reviewBatchDiscountDiv${m.batchVariantID}" style=" width:10% ;color:#ba1800">${m.discountValues}</td>
                        <td style='width:15%'>
                            <div class='flex-row' id="batchDiv${m.batchVariantID}" >
                                <button  class='btn btn-primary btn-xs quant-chng-btn' id="reviewBatch${m.batchVariantID}dec" onclick="decreaseQuant(${m.batchVariantID},'reviewBatch')"> - </button>
                                    <input value="${m.quantityOrdered}" min="0" onkeypress="return event.charCode >= 48" onkeyup="changeQuantity(${m.batchVariantID},'reviewBatch')" onclick="changeQuantity(${m.batchVariantID},'reviewBatch')"  type='number' class='quantityInput' id="reviewBatch${m.batchVariantID}input" name='inventory' style='background:rgba(229, 230, 230, 0.25)' />
                                <button class='btn btn-primary btn-xs quant-chng-btn'  id="reviewBatch${m.batchVariantID}inc"  onclick="increaseQuant(${m.batchVariantID},'reviewBatch')"> + </button>
                            </div>
                        </td>
                        <td id="reviewBatchPriceDiv${m.batchVariantID}" style='width:10%' >${(m.productValue).toFixed(2)}</td>
                        <td style='width:5%' ><img onclick="deleteProduct(${m.productID},'batch',${m.batchVariantID})" src = "../../assets/img/trash-gray.png"></td>
                    </tr>`)
                }
            }
        })
    return html.join('')
}

renderReviewPrice=(value,row)=>{
    return `<div  id="reviewPriceDiv${row.productID}">${row.productValue}</div>`;
}
renderReviewUnit=(value,row)=>{
    var finalQuantityOrdered = row.quantityOrdered
    if(row.childQuantityOrdered){
        finalQuantityOrdered = row.quantityOrdered+row.childQuantityOrdered
    }
    return `<div  id="reviewUnitDiv${row.productID}">${finalQuantityOrdered}</div>`;
}

renderReviewDiscount=(value,row)=>{
    return `<div  id="reviewDiscountDiv${row.productID}">${row.discountValues}</div>`;
}

back=()=>{
    getProducts()
    $('#billingCart').css('display','block');
    $('#reviewBillingCart').css('display','none');

    // var aplliedProductList = []
    // if(filtersApplied){
    //     aplliedProductList = filteredFinalProductData
    // }
    // else{
    //     aplliedProductList = finalProductData
    // }

    // aplliedProductList.sort((a,b)=>(b.quantityOrdered) - (a.quantityOrdered))

    // $('#billingCart').css('display','block');
    // $('#reviewBillingCart').css('display','none');
    // $('#productList').bootstrapTable('destroy');
    // $('#productList').bootstrapTable(
    //     {data:aplliedProductList,
    //     search:true,
    //     reinit: true,
    //     pagination:true,
    //     trimOnSearch:false,
    // });
    // $('#bottomBtns').css({"display":'flex'})
    // $('#topBtns').css({"display":'flex'})
    // $('#switchFilters').css('display','flex')    
    // $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    // $('.customInputSearchDiv').addClass('flex-row margin-20')
    // $("#productList").bootstrapTable("uncheckBy", { field: "quantityOrdered", values: [0] })
}

function goBack(){
    if(cartData.length){
        var message = 'The items present in your cart will be lost. Are you sure you want to exit?'
        const dialogOptions = {type: 'info', buttons: ['Cancel', 'OK'], message: message}
        dialog.showMessageBox(dialogOptions, async i => {
            if(i){  
                window.location.href = reRenderLocation;
            }
        })
        return false
    }
    else{
        window.location.href = reRenderLocation;
    }
}

handleCartChange = (sProductBatchData,productID,currentValue,type,action)=>{
    var fifoSBatchData = sProductBatchData
    if(type=='prod'){
        var filteredProdBatchData = fifoSBatchData.filter(m=>(m.productID==productID && m.sbomDesc!="LSBOM-C"))
        var maxUnitLimit = currentValue;
    
        filteredProdBatchData.map(m=>{
            if(maxUnitLimit>m.inventory){
                m.quantityOrdered=m.inventory;
                m.currentInventory=0;
                m.batchPrice = parseFloat((m.turPerUnit*m.inventory).toFixed(3))	
                maxUnitLimit=maxUnitLimit-m.inventory;
            }
            else{
                m.quantityOrdered=maxUnitLimit;
                m.currentInventory=m.inventory - maxUnitLimit;
                m.batchPrice = parseFloat((m.turPerUnit*maxUnitLimit).toFixed(3))
                maxUnitLimit=0
            }
            m.childQuantityOrdered = 0
            return m
        })
    }
    
    handleChildProductBatchToCart(fifoSBatchData,productID,type,action)
}

handleChildProductBatchToCart = (fifoSBatchData,productID,type,action)=>{
    let sbomSBatchData = fifoSBatchData

    checkReviewRender = (selectedProductBatchData.filter(a=>a.isChild == true)).length

    // let filteredProdBatchData = sbomSBatchData.filter(m=>(m.productID==productID))
    sbomSBatchData.map(async m=>{
        let sBomCart=[];
        if(m.sbomDesc == "LSBOM-P"){
            m.isChild = false;
            m.isParent = true;
            m.childItem={
                aipPerCase:0,
                aipPerUnit:0,
                basePackCode:0,
                batchVariantID:m.batchVariantID,
                childSkuQty:0,
                cpLinkage:'',
                mrpPerCase:0,
                mrpPerUnit:0,
                parentSkuQty:0,
                productID:m.productID,
                turPerCase:0,
                turPerUnit:0,
                variantID:0,
            }  

            // if(m.quantityOrdered<parseInt(m.parentSkuQty)){
            //     batchDataForRenderReset =  sbomSBatchData.filter(n=>n.serialNumber==m.cpLinkage)
            //     batchDataForRenderReset.map(j=>{
            //         j.childQuantityOrdered = 0
            //         $('#reviewBatch'+j.batchVariantID+'input').val(0)
            //     })
            // }
            
            sbomSBatchData =  sbomSBatchData.filter(n=>n.serialNumber!=m.cpLinkage)

            var childBatches = []
            var i = 0;
            var maxUnitLimit = 0
            var query;
            if(m.quantityOrdered>=parseInt(m.parentSkuQty)){
                i = Math.floor(m.quantityOrdered/parseInt(m.parentSkuQty));
                query = `SELECT batchProductVariants.* , storeRegion.mrpPerUnit AS MRP, storeRegion.turPerUnit,  storeRegion.cpLinkage,storeRegion.parentSkuQty,storeRegion.childSkuQty FROM batchProductVariants LEFT JOIN storeRegion ON batchProductVariants.serialNumber = storeRegion.sku  WHERE serialNumber = '${m.cpLinkage}' AND  batchProductVariants.inventory > 0  order by manufacturingDate asc `
                childBatches = await fetchChildBatches(query)

                // m.childItem={...childBatches[0]} 
                if(childBatches.length){              
                    m.childItem={
                        aipPerCase:0,
                        aipPerUnit:0,
                        basePackCode:0,
                        batchVariantID:childBatches[0].batchVarRefID,
                        childSkuQty:childBatches[0].childSkuQty,
                        cpLinkage:childBatches[0].cpLinkage,
                        mrpPerCase:0,
                        mrpPerUnit:0,
                        parentSkuQty:childBatches[0].parentSkuQty,
                        productID:childBatches[0].productID,
                        turPerCase:0,
                        turPerUnit:0,
                        variantID:childBatches[0].variantID,
                    }  
                    
                    maxUnitLimit = i*parseInt(m.childSkuQty);
    
                    childBatches.map(n=>{
                        if(maxUnitLimit>n.inventory){
                            n.childQuantityOrdered=n.inventory;
                            n.currentInventory=0;
                            n.batchPrice = parseFloat((n.turPerUnit*n.inventory).toFixed(3))	
                            maxUnitLimit=maxUnitLimit-n.inventory;
                        }
                        else{
                            n.childQuantityOrdered=maxUnitLimit;
                            n.currentInventory=n.inventory - maxUnitLimit;
                            n.batchPrice = parseFloat((n.turPerUnit*maxUnitLimit).toFixed(3))
                            maxUnitLimit=0
                        }
                        sBomCart = sBomCart.filter(l=>l.batchVariantID!=n.batchVariantID)
                        var pkm = moment(m.manufacturingDate).format("MMM, YYYY");
                        n.quantityOrdered=0;
                        n.isChild = true;
                        n.isParent = false;
                        n.taxes = [];
                        n.CGST = 0;
                        n.SGST = 0;
                        n.totalTaxPercentage=0;
                        n.productActualPrice = 0;
                        n.productBasePrice = 0;
                        // n['discountValues'] = 0
                        // n['btprDiscountValues'] = 0
                        // n['stprDiscountValues'] = 0
                        // n['stprCashDiscountValues'] = 0
                        // n['discounts'] = []
                        n['pkm']=pkm
                        n.childItem={
                            aipPerCase:0,
                            aipPerUnit:0,
                            basePackCode:0,
                            batchVariantID:n.batchVariantID,
                            childSkuQty:0,
                            cpLinkage:'',
                            mrpPerCase:0,
                            mrpPerUnit:0,
                            parentSkuQty:0,
                            productID:n.productID,
                            turPerCase:0,
                            turPerUnit:n.turPerUnit,
                            variantID:n.variantID,
                        }
                        sBomCart.push(n)
                    }) 
                }
          
            }
        }
        else{
            // m.isChild = false;
            // m.isParent = false;
            m.childItem={
                aipPerCase:0,
                aipPerUnit:0,
                basePackCode:0,
                batchVariantID:m.batchVariantID,
                childSkuQty:0,
                cpLinkage:'',
                mrpPerCase:0,
                mrpPerUnit:0,
                parentSkuQty:0,
                productID:m.productID,
                turPerCase:0,
                turPerUnit:0,
                variantID:0,
            }
        }
        sbomSBatchData = [...sbomSBatchData,...sBomCart]

        let grouppedBatchArray=_.groupBy(sbomSBatchData,'batchVariantID')

        console.log(grouppedBatchArray,'grouppedBatchArray')

        for (x in grouppedBatchArray){
            cSBomCart = grouppedBatchArray[x]
            if(cSBomCart[0].isChild){
                quantSum = 0
                cSBomCart.map(s=>{
                    if(s.childQuantityOrdered > 0){
                        quantSum+=s.childQuantityOrdered; 
                    }
                })
                cSBomCart[0]['childQuantityOrdered'] = quantSum;
                sbomSBatchData = sbomSBatchData.filter(a=>a.batchVariantID!= cSBomCart[0].batchVariantID  )
                sbomSBatchData.push(cSBomCart[0])
            }
        }

        // fsBomCart = sBomCart.filter(g=>g.quantityOrdered>0)
        let grouppedProdArray=_.groupBy(sbomSBatchData,'productID')
            
        for (x in grouppedProdArray){
            //cfsBomCart = JSON.parse(JSON.stringify(grouppedProdArray[x][0]));
            cfsBomCart = grouppedProdArray[x];
            ff = finalProductData.find(b=>b.productID == cfsBomCart[0].productID)

            if(cfsBomCart[0].isChild){
                // var quantSum = 0
                // cfsBomCart.map(s=>{
                //     if(s.childQuantityOrdered > 0){
                //         quantSum+=s.childQuantityOrdered; 
                //     }
                // })
                // cfsBomCart[0]['childQuantityOrdered'] = quantSum;
                // ff.childQuantityOrdered = cfsBomCart[0].childQuantityOrdered
                //ff.isChild = true
                
                selectedProductData = selectedProductData.filter(a=>a.productID!= cfsBomCart[0].productID)
                selectedProductData.push(ff)
                // var reviewSectionDisplay = $('#reviewBillingCart').css('display')
                // console.log(reviewSectionDisplay,'reviewSectionDisplay')
                // if(reviewSectionDisplay == 'flex'){
                //     proceedCart()
                // }
            }
        }
        handleDiscountToCart(sbomSBatchData,productID,type,action)
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
    console.log(childBatches,'childBatches')
    return childBatches
}

handleProductBasePriceForDiscount=(sbomSBatchData,taxListData,productID)=>{
    let sProdData = selectedProductData

    let productBasePriceBatches = sbomSBatchData

    var filteredProdBatchData = productBasePriceBatches.filter(m=>(m.productID==productID))
    filteredProdBatchData.map(m=>{
        sProdData.map(n=>{
            if(n.productID == m.productID){
                var taxArray = n.taxIDs.split(",")
                totalTax = 0;
                var taxes = []
                taxArray.map(l=>{
                    taxListData.map(k=>{
                        if(k.taxID==l){
                            taxes.push(k)
                            totalTax= parseFloat(k.taxPercentage) + totalTax;
                        }
                    })
                })
                m.taxes = taxes
                m.totalTaxPercentage=totalTax;
                m.productActualPrice = m.turPerUnit;
                m.productBasePrice = parseFloat((m.productActualPrice/((totalTax+100)/100)).toFixed(3));
            }
        })
    })
    return productBasePriceBatches;
}

handleDiscountToCart=(sbomSBatchData,productID,type,action)=>{
    let sDiscountProductList=discountProductList;
    let sDiscountAppliedIDs=discountAppliedIDs;
    let sDiscountDetails = discountDetails;
    let sDiscountLevelList=discountLevelList;
    let sDiscountClusters = discountClusters;
    let taxListData = taxList;

    var discountedSBatchData =  handleProductBasePriceForDiscount(sbomSBatchData,taxListData,productID)

    discountedSBatchData.map((l)=>{ 
        l['discounts'] = []
        l['discountValues'] = 0
        l['stprDiscountValues'] = 0
        l['btprDiscountValues'] = 0
        l['stprCashDiscountValues'] = 0
    })          
        
    var cashDiscArray=[]
    sDiscountAppliedIDs.map(a=>{
        sDiscountProductList.map((b)=>{
            appliedDiscountLevel = []
            appliedDiscountDetailsObj = {}
            appliedDiscountProductMapping = {}
            if(a.discountID == b.discountID){
                appliedDiscountProductMapping = b
                appliedDiscountID = b.discountID
                prodArry =  (b.discountProductList).split(",")
                batchArry =  (b.discountProdBatchVariantList).split("|")
                batchArry.pop()
                eligibleQuant = 0;
                eligibleValue = 0;
                eligibleValueByActualPrice = 0;
                eligibleWeight = 0;
                eligibleQuantValue = 0;
                eligibleTotalWeightValue = 0;
                applicableCartBatches = []
                
                prodArry.map((c,i)=>{
                    filteredCartBatches = []
                    if(c=='ALL'){
                        filteredCartBatches = discountedSBatchData
                    }
                    else{
                        if(batchArry[i]=='ALL'){
                            filteredCartBatches = discountedSBatchData.filter(d=>c==d.productID)
                        }
                        else{
                            if(batchArry[i]){
                                eligibleBatchesID = batchArry[i].split(",")
                                filteredCartBatches = discountedSBatchData.filter(o2 => eligibleBatchesID.some(o1 => o1== o2.batchVarRefID));
                            }
                        }
                    }
                    if(filteredCartBatches.length){
                        applicableCartBatches = [...applicableCartBatches,...filteredCartBatches]
                    }
                })
          
                applicableCartBatches=applicableCartBatches.filter(z=> z.quantityOrdered>0 && z.sbomDesc != "LSBOM-C")
                if(applicableCartBatches.length){                                        
                    appliedDiscountDetailsObj = sDiscountDetails.find(f=>f.discountID == appliedDiscountID)

                    appliedDiscountLevel = sDiscountLevelList.filter(g=>g.discountID ==appliedDiscountID)

                    var cumBilledQty;
                    var billedQty;
                    var billedValue;
                    var billSchemeValue;
                    var discountValue;
                    var finalDiscountValue;

                    var eligibleAppliedDiscountLevel;

                    if(appliedDiscountDetailsObj.activityClassification=='SECONDARY TPR'){
                        appliedDiscountClusters =  sDiscountClusters.filter(y=>y.discountID==appliedDiscountID)

                        var clusterCount=0;
                        var eligibleValue=0;
                        var btprApplicableBatches=[]
                        appliedDiscountClusters.map(w=>{
                            var addCluster = false;
                            clusterProdList = (w.productList).split(",")
                            applicableCartBatches.map((x)=>{
                                if(clusterProdList.indexOf(`${x.productID}`) != -1){
                                    addCluster = true
                                    console.log(x.productID,'x.productID',appliedDiscountClusters)
                                    filteredBtprCartBatches = applicableCartBatches.filter(s=> s.batchVariantID==x.batchVariantID)
                                    if(filteredBtprCartBatches.length){
                                        btprApplicableBatches = [...btprApplicableBatches,...filteredBtprCartBatches]
                                    }
                                }
                                // else{
                                //     btprApplicableBatches=btprApplicableBatches.filter(s=>s.productID!=x.productID)
                                //    // btprApplicableBatches = [...btprApplicableBatches,...filteredBtprBatches]
                                // }
                            })
                            if(addCluster){
                                clusterCount++;
                            }
                        })

                        if(clusterCount){
                            console.log(clusterCount,'clusterCount',btprApplicableBatches)
                            eligibleAppliedDiscountLevel = appliedDiscountLevel.find(h=>(clusterCount >= h.fromQuantity &&  clusterCount <= h.toQuantity))
                            console.log(eligibleAppliedDiscountLevel,'eligibleAppliedDiscountLevel')
                        }
                       
                        if(eligibleAppliedDiscountLevel){
                            var discountType = eligibleAppliedDiscountLevel.discountType
                            if(discountType == 'PERCENTAGE'){
                                btprApplicableBatches.map((j)=>{
                                    cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                    eligibleValue = j.turPerUnit * j.quantityOrdered
                                    discountValue =(eligibleValue * eligibleAppliedDiscountLevel.discountValue/ 100);

                                    cDiscountDetailsObj['discountValue'] =  eligibleAppliedDiscountLevel.discountValue
                                    cDiscountDetailsObj['discountPrice'] = parseFloat(discountValue.toFixed(3))
                                    cDiscountDetailsObj['btprDiscountValue'] = parseFloat(discountValue.toFixed(3))
                                    cDiscountDetailsObj['stprDiscountValue'] = 0
                                    cDiscountDetailsObj['stprCashDiscountValue'] = 0
                                    cDiscountDetailsObj['discountType'] = 'PERCENTAGE'
                                    cDiscountDetailsObj['discountLevel'] = appliedDiscountLevel
                                    cDiscountDetailsObj['discountProductMap'] = appliedDiscountProductMapping
                                    cDiscountDetailsObj['discountClusters'] = appliedDiscountClusters

                                    if(j.discounts){
                                        j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                        j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                    }else{        
                                        j['discounts'] = [cDiscountDetailsObj]
                                    }
                                    discntArry =   j.discounts
                                    discSum = 0
                                    btprDiscSum = 0
                                    discntArry.map(v=>{
                                        discSum += v.discountPrice
                                        btprDiscSum +=v.btprDiscountValue
                                    })
                                    j.discountValues = parseFloat(discSum.toFixed(3))
                                    j.btprDiscountValues = parseFloat(btprDiscSum.toFixed(3))
                                })
                                console.log(btprApplicableBatches,'btprApplicableBatches')
                            }
                        }
                    }
                    else{
                        if(appliedDiscountDetailsObj.isCashDiscount){
                            cashDiscArray =cashDiscArray.filter(a=>a.discountID!=appliedDiscountDetailsObj.discountID)
                            appliedDiscountDetailsObj['discountLevel'] = appliedDiscountLevel
                            appliedDiscountDetailsObj['discountProductMap'] = appliedDiscountProductMapping
                            cashDiscArray.push(appliedDiscountDetailsObj)

                            console.log(cashDiscArray,'cashDiscArray')
                        }
                        else{
                            applicableCartBatches.map(e=>{
                                eligibleQuant +=e.quantityOrdered
                                eligibleValue +=(e.productBasePrice*e.quantityOrdered)
                                eligibleValueByActualPrice +=(e.productActualPrice*e.quantityOrdered)
                                eligibleQuantValue +=(e.productBasePrice*e.quantityOrdered)
                                if(e.weightUnit == "GMS" || e.weightUnit == "ML"){
                                    eligibleWeight +=(e.quantityOrdered*e.weight/1000)
                                    eligibleTotalWeightValue +=(e.productBasePrice*e.weight*e.quantityOrdered/1000)
                                }
                                else{
                                    eligibleWeight +=(e.quantityOrdered*e.weight)
                                    eligibleTotalWeightValue +=(e.productBasePrice*e.weight*e.quantityOrdered) 
                                }
                            })
                            
                            var eligibleValueByActualPriceRounded = parseInt(eligibleValueByActualPrice)
                            var eligibleWeightRounded = parseInt(eligibleWeight)
        
                                var discountSchemeBasis = appliedDiscountLevel[0].schemeBasis
                                switch(discountSchemeBasis){
                                    case 'UNIT':
                                    eligibleAppliedDiscountLevel = appliedDiscountLevel.find(h=>(eligibleQuant >= h.fromQuantity &&  eligibleQuant <= h.toQuantity))
                                    break;
            
                                    case 'VALUE':
                                    eligibleAppliedDiscountLevel = appliedDiscountLevel.find(h=>(eligibleValueByActualPriceRounded >= h.fromQuantity &&  eligibleValueByActualPriceRounded <= h.toQuantity))
                                    break;
            
                                    case 'WEIGHT':
                                    eligibleAppliedDiscountLevel = appliedDiscountLevel.find(h=>(eligibleWeightRounded >= h.fromQuantity &&  eligibleWeightRounded<= h.toQuantity))
                                    break;
                                }
                                console.log(discountSchemeBasis,'discountSchemeBasis',eligibleWeight,'eligibleWeight')
                                if(eligibleAppliedDiscountLevel){
                                    if(discountSchemeBasis == 'WEIGHT'){
                                        var discountType = eligibleAppliedDiscountLevel.discountType
                
                                        cumBilledQty = eligibleWeight;
                                        billedQty = parseInt(cumBilledQty /eligibleAppliedDiscountLevel.forEvery);
                
                                        cumBilledValue= eligibleQuantValue
                                        billSchemeValue =(billedQty * eligibleAppliedDiscountLevel.forEvery) * (cumBilledValue / cumBilledQty);
                                        // billSchemeValue =parseFloat((billedQty * eligibleAppliedDiscountLevel.forEvery) * (cumBilledValue / cumBilledQty).toFixed(3));
                                        
                                        totalValue = eligibleTotalWeightValue
            
                                        console.log(eligibleTotalWeightValue,eligibleWeight)
                                        if(discountType == 'PERCENTAGE'){
                                            applicableCartBatches.map((j)=>{
                                                cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                                if(j.weightUnit == "GMS" || j.weightUnit == "ML"  ){
                                                    lineWeight = j.productBasePrice*j.quantityOrdered*j.weight/1000
                                                }
                                                else{
                                                    lineWeight = j.productBasePrice*j.quantityOrdered*j.weight
                                                }
                                                discountValue =(billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100);
                                                // discountValue =parseFloat((billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100).toFixed(3));
                                                finalDiscountValue = (discountValue / totalValue * (lineWeight));
                                                cDiscountDetailsObj['discountValue'] =  eligibleAppliedDiscountLevel.discountValue
                                                cDiscountDetailsObj['discountPrice'] = parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['stprDiscountValue'] = parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['btprDiscountValue'] = 0
                                                cDiscountDetailsObj['stprCashDiscountValue'] = 0
                                                cDiscountDetailsObj['discountType'] = 'PERCENTAGE'
                                                cDiscountDetailsObj['discountLevel'] = appliedDiscountLevel
                                                cDiscountDetailsObj['discountProductMap'] = appliedDiscountProductMapping
                                          
                                                if(j.discounts){
                                                    j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                                    j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                                }else{        
                                                    j['discounts'] = [cDiscountDetailsObj]
                                                }
                                                discntArry =   j.discounts
                                                discSum = 0
                                                stprDiscSum = 0
                                                discntArry.map(v=>{
                                                    discSum += v.discountPrice
                                                    stprDiscSum += v.stprDiscountValue
                                                })
                                                j.discountValues = parseFloat(discSum.toFixed(3))
                                                j.stprDiscountValues = parseFloat(stprDiscSum.toFixed(3))
                                            })
                                        }
                                        else if(discountType == 'ABSOLUTE'){
                                            applicableCartBatches.map((j)=>{
                                                cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                                if(j.weightUnit == "GMS" || j.weightUnit == "ML" ){
                                                    lineWeight = j.productBasePrice*j.quantityOrdered*j.weight/1000
                                                }
                                                else{
                                                    lineWeight = j.productBasePrice*j.quantityOrdered*j.weight
                                                }
                                                console.log(lineWeight,'lineWeight')
                                                var revereseTax = (j.totalTaxPercentage+100)/100
                                                //var revereseTax = parseFloat(((j.totalTaxPercentage+100)/100)).toFixed(3)
                                                discountValue = (billedQty * eligibleAppliedDiscountLevel.discountValue/ revereseTax)
                                                //discountValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.discountValue/ revereseTax).toFixed(3))
                                                finalDiscountValue = (discountValue*lineWeight / cumBilledValue)
                
                                                cDiscountDetailsObj['discountValue'] =  eligibleAppliedDiscountLevel.discountValue
                                                cDiscountDetailsObj['discountPrice'] = parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['stprDiscountValue'] = parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['btprDiscountValue'] = 0
                                                cDiscountDetailsObj['stprCashDiscountValue'] = 0
                                                cDiscountDetailsObj['discountType'] = 'ABSOLUTE'
                                                cDiscountDetailsObj['discountLevel'] = appliedDiscountLevel
                                                cDiscountDetailsObj['discountProductMap'] = appliedDiscountProductMapping
                                   
            
                                                if(j.discounts){
                                                    j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                                    j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                                }else{        
                                                    j['discounts'] = [cDiscountDetailsObj]
                                                }
                                                discntArry =   j.discounts
                                                discSum = 0
                                                stprDiscSum = 0
                                                discntArry.map(v=>{
                                                    discSum += v.discountPrice
                                                    stprDiscSum += v.stprDiscountValue
                                                })
                                                j.discountValues = parseFloat(discSum.toFixed(3))
                                                j.stprDiscountValues = parseFloat(stprDiscSum.toFixed(3))
                                            })
                
                                        }
                                    }
                
                
                                    else if(discountSchemeBasis == 'VALUE'){
                                        var discountType = eligibleAppliedDiscountLevel.discountType
                
                                        cumBilledQty = eligibleQuant;
                                        billedQty = parseInt(cumBilledQty/eligibleAppliedDiscountLevel.forEvery)
                
                                        billedValue = eligibleValueByActualPrice;
                
                                        billSchemeValue = (billedQty * eligibleAppliedDiscountLevel.forEvery * (billedValue / cumBilledQty))
                                        //billSchemeValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.forEvery * (billedValue / cumBilledQty)).toFixed(3));
                                        
                                        if(discountType == 'PERCENTAGE'){
                                            applicableCartBatches.map((j)=>{
                                                cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj)); 
                                                var linePrice = j.productBasePrice*j.quantityOrdered;
                
                                                discountValue =(billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100)
                                                // discountValue =parseFloat((billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100).toFixed(3));
                                                finalDiscountValue = (discountValue / billedValue * (linePrice))
                                                
                                                cDiscountDetailsObj['discountValue'] =  eligibleAppliedDiscountLevel.discountValue
                                                cDiscountDetailsObj['discountPrice'] =  parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['stprDiscountValue'] =  parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['btprDiscountValue'] = 0
                                                cDiscountDetailsObj['stprCashDiscountValue'] = 0
                                                cDiscountDetailsObj['discountType'] = 'PERCENTAGE'
                                                cDiscountDetailsObj['discountLevel'] = appliedDiscountLevel
                                                cDiscountDetailsObj['discountProductMap'] = appliedDiscountProductMapping
                                   

                                                if(j.discounts){
                                                    j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                                    j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                                }else{        
                                                    j['discounts'] = [cDiscountDetailsObj]
                                                }
                                                discntArry =   j.discounts
                                                discSum = 0
                                                stprDiscSum = 0
                                                discntArry.map(v=>{
                                                    discSum += v.discountPrice
                                                    stprDiscSum += v.stprDiscountValue
                                                })
                                                j.discountValues = parseFloat(discSum.toFixed(3))
                                                j.stprDiscountValues = parseFloat(stprDiscSum.toFixed(3))
                                            })
                                        }
                                        else if(discountType == 'ABSOLUTE'){
                                            applicableCartBatches.map((j)=>{
                                                cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                                var lineQuant =j.quantityOrdered
                                                discountValue = (billedQty * eligibleAppliedDiscountLevel.discountValue)
                                                //discountValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.discountValue).toFixed(3))
                                                finalDiscountValue = (discountValue*lineQuant / cumBilledQty)
                                                //finalDiscountValue = parseFloat((discountValue*lineQuant / cumBilledQty).toFixed(3))
        
                                                cDiscountDetailsObj['discountValue'] =  eligibleAppliedDiscountLevel.discountValue
                                                cDiscountDetailsObj['discountPrice'] =   parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['stprDiscountValue'] =  parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['btprDiscountValue'] = 0
                                                cDiscountDetailsObj['stprCashDiscountValue'] = 0
                                                cDiscountDetailsObj['discountType'] = 'ABSOLUTE'
                                                cDiscountDetailsObj['discountLevel'] = appliedDiscountLevel
                                                cDiscountDetailsObj['discountProductMap'] = appliedDiscountProductMapping
                                   

                                                if(j.discounts){
                                                    j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                                    j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                                }else{        
                                                    j['discounts'] = [cDiscountDetailsObj]
                                                }
                                                discntArry =   j.discounts
                                                discSum = 0
                                                stprDiscSum = 0
                                                discntArry.map(v=>{
                                                    discSum += v.discountPrice
                                                    stprDiscSum += v.stprDiscountValue
                                                })
                                                j.discountValues = parseFloat(discSum.toFixed(3))
                                                j.stprDiscountValues = parseFloat(stprDiscSum.toFixed(3))
                                            })
                
                                        }
                                    }
                
                                    else if(discountSchemeBasis == 'UNIT'){
                                        var discountType = eligibleAppliedDiscountLevel.discountType
                
                                        cumBilledQty = eligibleQuant;
                                        billedQty = parseInt(cumBilledQty/eligibleAppliedDiscountLevel.forEvery)
                
                                        billedValue = eligibleValue;
                
                                        billSchemeValue = (billedQty * eligibleAppliedDiscountLevel.forEvery * (billedValue / cumBilledQty))
                                        //billSchemeValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.forEvery * (billedValue / cumBilledQty)).toFixed(3));
                                        
                                        if(discountType == 'PERCENTAGE'){
                                            applicableCartBatches.map((j)=>{
                                                cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                                var linePrice = j.productBasePrice*j.quantityOrdered
                                                //discountValue =parseFloat((billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100).toFixed(3));
                                                discountValue =(billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100)
        
                                                finalDiscountValue = (discountValue / billedValue * (linePrice))
                                                cDiscountDetailsObj['discountValue'] =  eligibleAppliedDiscountLevel.discountValue
                                                cDiscountDetailsObj['discountPrice'] =    parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['stprDiscountValue'] =    parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['btprDiscountValue'] = 0
                                                cDiscountDetailsObj['stprCashDiscountValue'] = 0
                                                cDiscountDetailsObj['discountType'] = 'PERCENTAGE'
                                                cDiscountDetailsObj['discountLevel'] = appliedDiscountLevel
                                                cDiscountDetailsObj['discountProductMap'] = appliedDiscountProductMapping
                                   

                                                if(j.discounts){
                                                    j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                                    j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                                }else{        
                                                    j['discounts'] = [cDiscountDetailsObj]
                                                }
                                                discntArry =   j.discounts
                                                discSum = 0
                                                stprDiscSum = 0
                                                discntArry.map(v=>{
                                                    discSum += v.discountPrice
                                                    stprDiscSum += v.stprDiscountValue
                                                })
                                                j.discountValues = parseFloat(discSum.toFixed(3))
                                                j.stprDiscountValues = parseFloat(stprDiscSum.toFixed(3))
                                            })
                                        }
                                        else if(discountType == 'ABSOLUTE'){
                                            applicableCartBatches.map((j)=>{
                                                cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                                var lineQuant =j.quantityOrdered
                                                var revereseTax = (j.totalTaxPercentage+100)/100;
                                                //var revereseTax = parseFloat(((j.totalTaxPercentage+100)/100)).toFixed(3)
                                                discountValue = (billedQty * eligibleAppliedDiscountLevel.discountValue/ revereseTax)
                                                //discountValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.discountValue/ revereseTax).toFixed(3))
                                                finalDiscountValue = (discountValue*lineQuant / cumBilledQty)
                                                //finalDiscountValue = parseFloat((discountValue*lineQuant / cumBilledQty).toFixed(3))
                                                
                                                cDiscountDetailsObj['discountValue'] =  eligibleAppliedDiscountLevel.discountValue
                                                cDiscountDetailsObj['discountPrice'] = parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['stprDiscountValue'] = parseFloat(finalDiscountValue.toFixed(3))
                                                cDiscountDetailsObj['btprDiscountValue'] = 0
                                                cDiscountDetailsObj['stprCashDiscountValue'] = 0
                                                cDiscountDetailsObj['discountType'] = 'ABSOLUTE'
                                                cDiscountDetailsObj['discountLevel'] = appliedDiscountLevel
                                                cDiscountDetailsObj['discountProductMap'] = appliedDiscountProductMapping
                                   
                                                
                                                if(j.discounts){
                                                    j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                                    j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                                }else{        
                                                    j['discounts'] = [cDiscountDetailsObj]
                                                }
                                                discntArry =   j.discounts
                                                discSum = 0
                                                stprDiscSum = 0
                                                discntArry.map(v=>{
                                                    discSum += v.discountPrice
                                                    stprDiscSum += v.stprDiscountValue
                                                })
                                                j.discountValues = parseFloat(discSum.toFixed(3))
                                                j.stprDiscountValues = parseFloat(stprDiscSum.toFixed(3))
                                            })
                
                                        }
                                    }
                                }
                                else{
                                    applicableCartBatches.map((l)=>{ 
                                        cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                        if(l.discounts){
                                            l.discounts = l.discounts.filter(m=>m.discountID!=cDiscountDetailsObj.discountID)     
                                        }
                                        else{
                                            l['discounts'] = []
                                        }
                                        l['discountValues'] = 0
                                        l['stprDiscountValues'] = 0
                                        l['btprDiscountValues'] = 0
                                        l['stprCashDiscountValue'] = 0
                                    })          
                                }
                            }
                        }
                    }
                // else{
                //     discountedTaxedSBatchData.map((l)=>{ 
                //         l['discounts'] = []
                //         l['discountValues'] = 0
                //         l['stprDiscountValues'] = 0
                //         l['btprDiscountValues'] = 0
                //         l['stprCashDiscountValues'] = 0
                //     })          
                // }
            }
        })
    })
    if(cashDiscArray.length){
        var discountedSBatchData =  handleCashDiscount(discountedSBatchData,cashDiscArray)

        handleTaxToCart(discountedSBatchData,productID,type,action)
    }
    else{
        handleTaxToCart(discountedSBatchData,productID,type,action)
    }
}

handleCashDiscount=(discountedBatchData,cashDiscArray)=>{
    var filteredDiscountedBatchData=discountedBatchData.filter(z=> z.quantityOrdered>0 && z.sbomDesc != "LSBOM-C") 
    filteredDiscountedBatchData.map((a)=>{      
        a['cashBasePrice'] = (a.productBasePrice)-(a.stprDiscountValues/a.quantityOrdered)
 
        cashDiscArray.map(b=>{
            if(b.discountType=="PERCENTAGE"){
                cCashDiscountObj = JSON.parse(JSON.stringify(b));        
                // cCashDiscountObj['discountValue'] =  cCashDiscountObj.discountValue;
                cashDiscPercent = cCashDiscountObj.discountValue;
                cCashDiscountObj['discountPrice'] =  parseFloat(((a.cashBasePrice*cCashDiscountObj.discountValue)/100 * a.quantityOrdered).toFixed(3)) 
                cCashDiscountObj['stprCashDiscountValue'] =  parseFloat(((a.cashBasePrice*cCashDiscountObj.discountValue)/100 * a.quantityOrdered).toFixed(3)) 
                cCashDiscountObj['stprDiscountValue'] = 0
                cCashDiscountObj['btprDiscountValue'] = 0

                if(a.discounts){
                    a.discounts = a.discounts.filter(k=>k.discountID!=b.discountID)
                    a.discounts = [...(a.discounts),cCashDiscountObj]
                }else{        
                    a['discounts'] = [cCashDiscountObj]
                }
            } 
            if(b.discountType=="ABSOLUTE"){
                cCashDiscountObj = JSON.parse(JSON.stringify(b));        
                // cCashDiscountObj['discountValue'] =  cCashDiscountObj.discountValue
                cashDiscPercent = cCashDiscountObj.discountValue;
                cCashDiscountObj['discountPrice'] =  parseFloat((cCashDiscountObj.discountValue * a.quantityOrdered).toFixed(3)) 
                cCashDiscountObj['stprCashDiscountValue'] =  parseFloat((cCashDiscountObj.discountValue * a.quantityOrdered).toFixed(3))  
                cCashDiscountObj['stprDiscountValue'] =  0;
                cCashDiscountObj['btprDiscountValue'] = 0;

                if(a.discounts){
                    a.discounts = a.discounts.filter(k=>k.discountID!=b.discountID)
                    a.discounts = [...(a.discounts),cCashDiscountObj]
                }else{        
                    a['discounts'] = [cCashDiscountObj]
                }
            } 
        })
        discntArry =   a.discounts
        discSum = 0
        stprDiscSum = 0
        discntArry.map(v=>{
            discSum += v.discountPrice
            stprDiscSum += v.stprCashDiscountValue
        })
        a.discountValues = parseFloat(discSum.toFixed(3))
        a.stprCashDiscountValues = parseFloat(stprDiscSum.toFixed(3))
    })

    return discountedBatchData
}

handleTaxToCart=(discountedSBatchData,productID,type,action)=>{ 
    var taxedSBatchData = discountedSBatchData

    //var filteredProdBatchData = taxedSBatchData.filter(m=>(m.productID==productID))
    taxedSBatchData.map(m=>{
        m.itemSales = parseFloat((m.productBasePrice * m.quantityOrdered).toFixed(3));
        //m.taxableValue = parseFloat((m.itemSales - m.discountValues).toFixed(3));
        m.taxableValue = parseFloat((m.itemSales - (m.stprDiscountValues+m.stprCashDiscountValues)).toFixed(3));
        //m.productValue = parseFloat((m.taxableValue*(100+totalTax)/100).toFixed(3));
        m.productValue = parseFloat(((m.taxableValue*(100+m.totalTaxPercentage)/100)-m.btprDiscountValues).toFixed(3));
        m.totalTaxValue = parseFloat((m.taxableValue*m.totalTaxPercentage/100).toFixed(3));
        m.taxValue = parseFloat((m.taxableValue*m.totalTaxPercentage/100).toFixed(3));
        if(m.taxes == undefined){
            cTaxes = [];
        }else{
            cTaxes = JSON.parse(JSON.stringify(m.taxes))
        }
        //cTaxes = JSON.parse(JSON.stringify(m.taxes))
        cTaxes.map(f=>{
            f['taxValue'] = parseFloat((m.taxableValue*f.taxPercentage/100).toFixed(3))
        })
        m.taxes = cTaxes
    })

    assignBatchToCart(taxedSBatchData,productID,type,action)    
}

assignBatchToCart=async (taxedSBatchData,productID,type,action)=>{
    var sProductData = selectedProductData
    var sProductBatchData = taxedSBatchData
   if(action=='remove'){
        var parentNoArr = []
        sProductBatchData.map(m=>{
            if(m.productID==productID && m.sbomDesc == 'LSBOM-P'){
                parentNoArr.push(m.cpLinkage)
            }
            return m
        })

        parentNoArr.map(l=>{
            sProductBatchData = sProductBatchData.filter(n=>n.serialNumber !=l)
        })
        
        sProductData.map(m=>{
            if(m.productID==productID){
                m.quantityOrdered = 0;
                m.productValue = 0
                m.productPrice = 0
            }
            return m
        })
        sProductBatchData = sProductBatchData.filter(m=>m.productID!=productID)
        sProductData = sProductData.filter(m=>m.productID!=productID)
    }
    
   cartData = sProductBatchData.filter(m=>(m.quantityOrdered>0|| m.childQuantityOrdered>0));

   selectedProductData = sProductData
    
   selectedProductBatchData = sProductBatchData

   reRenderTable(productID,cartData,selectedProductBatchData,selectedProductData,type)
}

reRenderTable=async (productID,cartData,selectedProductBatchData,selectedProductData,type)=>{
    totalUnits = 0;
    selectedProductData.map((m,i)=>{
        totalProductDiscount = 0
        totalProductValue = 0
        totalProductPrice = 0
        totalProductUnit = 0
        totalChildProductUnit = 0
        // totalTaxableValue = 0
   
        totalItemSales=0
        totalDiscountPrice=0
        totalGrossSale=0
        totalTaxValue=0
        totalCashDiscount = 0
        cartData.map((n)=>{
            if(m.productID==n.productID){
                totalProductDiscount +=parseFloat(n.discountValues);
                totalProductValue +=parseFloat(n.productValue);
                // totalTaxableValue+=parseFloat(n.taxableValue)

                //totalProductValue+=parseFloat(m.productValue);
                totalProductPrice+=parseFloat(n.batchPrice);
                if(n.sbomDesc != "LSBOM-C"){
                    totalProductUnit+=parseInt(n.quantityOrdered);
                }
                if(n.sbomDesc == "LSBOM-C"){
                    totalChildProductUnit+=parseInt(n.childQuantityOrdered);
                }
                
                m['productBasePrice'] = (n.productBasePrice);
                m['taxes'] = (n.taxes);
            }
            //$('#reviewBatchPriceDiv'+n.batchVariantID).html(n.productValue)
            //$('#reviewBatchDiscountDiv'+n.batchVariantID).html(n.discountValues)
            //$('#reviewBatchTaxDiv'+n.batchVariantID).html(n.taxValue)

            totalItemSales+=parseFloat(n.itemSales);
            totalDiscountPrice+=parseFloat(n.discountValues);
            totalGrossSale +=parseFloat(n.productValue);
            totalTaxValue +=parseFloat(n.totalTaxValue);

            var discArr = n.discounts
            discArr.map(a=>{
                if(a.isCashDiscount == 1){
                    totalCashDiscount += a.discountPrice
                }
            })
        })

        selectedProductBatchData.map(l=>{
            $('#reviewBatchPriceDiv'+l.batchVariantID).html((l.productValue).toFixed(2))
            $('#reviewBatchDiscountDiv'+l.batchVariantID).html(l.discountValues)
            $('#reviewBatchTaxDiv'+l.batchVariantID).html(l.taxValue)
            $('#reviewBatch'+l.batchVariantID+'input').val(l.quantityOrdered)
            if(l.sbomDesc=='LSBOM-C'){
                $('#reviewBatch'+l.batchVariantID+'input').val(l.childQuantityOrdered) 
            } 
        })

        m['discountValues'] = parseFloat(totalProductDiscount.toFixed(3))
        $('#reviewDiscountDiv'+m.productID).html(m.discountValues)

        m['productValue'] = totalProductValue.toFixed(2);
        $('#reviewPriceDiv'+m.productID).html(m.productValue)
        console.log(totalProductPrice,'totalProductPrice')
        m['productPrice'] = Math.round(totalProductPrice);
        $('#priceDiv'+m.productID).html(m.productPrice)

        m['quantityOrdered'] = totalProductUnit;
        m['childQuantityOrdered'] = totalChildProductUnit;
        // m['taxableValue'] = parseFloat(totalTaxableValue.toFixed(3));
        var finalQuantityOrdered = m.quantityOrdered
        if(m.childQuantityOrdered){
            m['isChild'] = true;
            finalQuantityOrdered = m.quantityOrdered+m.childQuantityOrdered
        }
        
        $('#reviewUnitDiv'+m.productID).html(finalQuantityOrdered)

        m['SNo'] = i+1;

        return m;
    })

    if(type != 'prod'){
        var productForRenderUnit = selectedProductData.find(m=>m.productID == productID)
        var prodID =  '#prod'+productID
        var inputID = prodID+'input';
        $(inputID).val(productForRenderUnit.quantityOrdered)
        if(productForRenderUnit.quantityOrdered<=0){
            $(prodID+'dec').attr('disabled',true)
            $(prodID+'inc').attr('disabled',false)
        }
        else if(productForRenderUnit.quantityOrdered>=productForRenderUnit.closingStock){
            $(prodID+'dec').attr('disabled',false)
            $(prodID+'inc').attr('disabled',true)
        }
        else{
            $(prodID+'dec').attr('disabled',false)
            $(prodID+'inc').attr('disabled',false)
        }
    }

    selectedProductData = selectedProductData.filter(m=>m.quantityOrdered>0 || m.childQuantityOrdered>0)

    totalCashDiscount = parseFloat(totalCashDiscount.toFixed(3))
    totalItemSales = parseFloat(totalItemSales.toFixed(3))
    totalDiscountPrice = parseFloat(totalDiscountPrice.toFixed(3))
    totalGrossSale = parseFloat(totalGrossSale.toFixed(3))
    totalTaxValue = parseFloat(totalTaxValue.toFixed(3))
    totalPrice = parseFloat(totalPrice.toFixed(3))

    totalUnits = cartData.length;
    var totalProdUnits = (selectedProductData.filter(a=>a.quantityOrdered>0 || a.childQuantityOrdered>0 )).length;    

    grossSaleRounded = Math.round(totalGrossSale);

    $('#totalCashDiscount').html(totalCashDiscount)
    $('#totalDiscountPrice').html(totalDiscountPrice)
    $('#totalItems').html(totalUnits)
    $('.packsAddedCount').text(`(${totalProdUnits})`)
    $('#totalPrice').html(grossSaleRounded)

    checkReviewRender2 = (selectedProductBatchData.filter(a=>a.isChild == true)).length
    console.log(checkReviewRender,checkReviewRender2,'checkReviewRender')
    if(checkReviewRender2 && checkReviewRender && (checkReviewRender2>checkReviewRender)){
        var reviewSectionDisplay = $('#reviewBillingCart').css('display')
        if(reviewSectionDisplay == 'flex'){
            proceedCart()
        }
    }
    else if(checkReviewRender2 && checkReviewRender && (checkReviewRender2<checkReviewRender)){
        var reviewSectionDisplay = $('#reviewBillingCart').css('display')
        if(reviewSectionDisplay == 'flex'){
            proceedCart()
        }
    }
    console.log(cartData,'cartData',selectedProductBatchData,'selectedProductBatchData',selectedProductData,'selectedProductData')
}

$(document).on("click", ".glyphicon-minus", function(){
    selectedProductBatchData.map(l=>{
        if(l.sbomDesc=='LSBOM-C'){
            $('#reviewBatch'+l.batchVariantID+'input').val(l.childQuantityOrdered) 
        } 
    })
});

checkCreditNotesAdjust=()=>{
    console.log(customerID,'customerID',totalGrossSale,'totalGrossSale')
    if(cartData.length == 0){
        var message = 'Please select stock!'
        isError(message)
        return false
    }
    
    if(generateBillDisabled){
        return false
    }
    else{
        generateBillDisabled = true
    }

    query = `SELECT DISTINCT creditNoteID,amount,description FROM creditNotes WHERE customerID = ${customerID} AND isActive = 1 GROUP BY creditNoteID ORDER BY amount asc`
    console.log(query,'query')
    var grossSale = totalGrossSale

    db.all(query,function(err,data){

        if(err){
            console.log(err)
        }
        else{
            data.sort((a,b)=>{
                return a.amount-b.amount
            })
            credits = data
            
            console.log(credits,'credits')
            
            if(credits.length == 0){
                withoutCreditNotesRedeemed()
            }
            else{
                $('#billAmount').text(Math.round(totalGrossSale))
                $("#myModal2").modal('show'); 
            }
        }
    })

}

withoutCreditNotesRedeemed=async()=>{
    $("#myModal2").modal('hide'); 
    //var grossSale = totalGrossSale;
    creditNotesAdjusted = false
    var grossSale = Math.round(totalGrossSale);
    cash = grossSale;
    sum = 0;

    var temp = [{paymentType:'PAYMENT_CASH',amount:grossSale}];

    var cashAccountID = await new Promise((resolve,reject)=>{

        db.get(`SELECT * FROM globalTypePaymentAccountIDMapping WHERE key = "PAYMENT_CASH"`,function(err,data){
    
            if(err){
                console.log(err)
            }
            else{
                resolve(data.accountID);
            }
        })
    })
    
    var cashAccountInfo = await new Promise((resolve,reject)=>{
    
        db.get(`SELECT * FROM accountInformation where accountID = ${cashAccountID}`,function(err,data){
    
            if(err){
                console.log(err)
            }
            else{
                resolve(data);
            }
        })
    })

    for(let i=0;i<temp.length;i++)
    {
        paymentGenerator(cashAccountInfo,temp[i],i)   
    }
    console.log(temp,'temp')
    adjustedPaymentList = temp
    proceedBill()
}

creditNotesRedeem=async()=>{
    $("#myModal2").modal('hide'); 
    creditNotesAdjusted = true
    //var grossSale = totalGrossSale
    var grossSale = Math.round(totalGrossSale);
    var creditNotesList = credits
    sum = 0;
    cash = 0;
    var endIndex;

    for(let i=0;i<creditNotesList.length;i++)
    {
        sum += parseFloat(creditNotesList[i].amount);
        console.log(sum,'sum')

        if(sum > grossSale){
            sum -= parseFloat(creditNotesList[i].amount);
            endIndex = i - 1;
            break;   
        }

        if(i == creditNotesList.length - 1){
            endIndex = i;
        }
    }

    cash = parseFloat((grossSale - sum).toFixed(3));
    console.log(sum,endIndex,cash)

    if(cash == 0){
        var temp = [];
    }
    else{
        var temp = [{paymentType:'PAYMENT_CASH',amount:cash}];
    }

    for(let i=0;i<=endIndex;i++)
    {

       temp.push({paymentType:'PAYMENT_CREDIT_NOTE',creditNoteID:creditNotesList[i].creditNoteID,description:creditNotesList[i].description,amount:parseFloat(creditNotesList[i].amount)});

    }

    var cashAccountID = await new Promise((resolve,reject)=>{

        db.get(`SELECT * FROM globalTypePaymentAccountIDMapping WHERE key = "PAYMENT_CASH"`,function(err,data){
    
            if(err){
                console.log(err)
            }
            else{
                resolve(data.accountID);
            }
        })
    })
    
    var cashAccountInfo = await new Promise((resolve,reject)=>{
    
        db.get(`SELECT * FROM accountInformation where accountID = ${cashAccountID}`,function(err,data){
    
            if(err){
                console.log(err)
            }
            else{
                resolve(data);
            }
        })
    })
    
    var creditAccountID = await new Promise((resolve,reject)=>{
    
        db.get(`SELECT * FROM globalTypePaymentAccountIDMapping WHERE key = "PAYMENT_CREDIT_NOTE"`,function(err,data){
    
            if(err){
                console.log(err)
            }
            else{
                resolve(data.accountID);
            }
        })
    })
    
    var creditAccountInfo = await new Promise((resolve,reject)=>{
    
        db.get(`SELECT * FROM accountInformation where accountID = ${creditAccountID}`,function(err,data){
    
            if(err){
                console.log(err)
            }
            else{
                resolve(data);
            }
        })
    })
    
    console.log(cashAccountID,cashAccountInfo,creditAccountID,creditAccountInfo)
    
    for(let i=0;i<temp.length;i++)
    {
        if(temp[i].paymentType == "PAYMENT_CASH"){
    
            paymentGenerator(cashAccountInfo,temp[i],i)   
        }
        else if(temp[i].paymentType == "PAYMENT_CREDIT_NOTE"){
    
            paymentGenerator(creditAccountInfo,temp[i],i);
            temp[i].transactionID = temp[i].creditNoteID;
            temp[i].description = temp[i].description
        }                    
    }
    //debugger;
    console.log(temp,'temp')

    adjustedPaymentList = temp
    $("#totalAmount").text(grossSale);
    $("#creditNotesAmount").text(sum);
    $("#cashAmount").text(cash);

    $("#myModal3").modal('show');
    // insert(adjustedPaymentList)
}

function paymentGenerator(account,temp,i){
    temp.accountId = account.accountID;
    temp.accountName = account.accountName;
    temp.accountType = account.accountType;
    temp.acquiringBankCode = "";
    // temp.amount = temp.amount;
    temp.approvalCode = "";
    temp.cardHolderName = "";
    temp.cardType = "";
    temp.expDate = "";
    temp.lastFourDigits = "";
    temp.newAmount = 0.0;
    temp.orderTimeLocal = "";
    temp.partType = "";
    temp.partyID = -1;
    temp.partyName = "";
    temp.paymentSubID = i + 1;
    temp.paymentTerminal = "";
    // temp.paymentType = "PAYMENT_CASH";
    temp.posDate = "";
    temp.transactionID = "";
    temp.transactionType = "TRN_ORDER";
    temp.userID = -1;
    temp.changeAmount = "";
    temp.tenderedAmount = "";
    temp.shortAmount = "";
    temp.tenderedAmountCurrency = "";
    temp.tenderedAmountCurrencyCF = "";
}


closeCreditNotesModal=()=>{
    $('#myModal3').modal('hide');
}

// closeBillModal=()=>{
//     $('#myModal4').modal('hide');
//     window.location.href= reRenderLocation
// }


async function proceedBill()
    
{
    $("#myModal3").modal('hide');
    statements = []
     var sales = 0;
    var netSale = 0;
    var grossSale = 0;
    var oldGrossSale = 0;
    rounding = 0
    var totalTaxes = 0;
    sales = totalItemSales;
    netSale = (totalItemSales - totalDiscountPrice);
    netSale = parseFloat(netSale.toFixed(2))
    totalTaxes = totalTaxValue;
    
    console.log(totalItemSales,totalDiscountPrice,totalGrossSale,totalTaxValue)
    

    oldGrossSale = totalGrossSale;
    grossSale = Math.round(totalGrossSale);
    rounding = parseFloat((grossSale - oldGrossSale).toFixed(3));

   
    var date = moment().format('YYYY-MM-DD','Asia/Kolkata');
    var dateCopy = moment().format('YYYYMMDD');

    var timezone="Asia/Kolkata";
    var deviceID = localStorage.getItem('deviceID');
    var store = JSON.parse(localStorage.getItem('loginResponse'));
    var storeID = store.storeList[0].storeID;
    var userName = JSON.parse(localStorage.getItem('phoneNumber'));
    var counter = localStorage.getItem('lastOrder');
    counter = parseInt(counter,10) + 1;

    localStorage.setItem('lastOrder',counter);

    orderID = 'OR1'+storeID+deviceID+dateCopy+'-'+counter;

    invoiceNo = counter

    var isError = '';
    var errorMessage = '';
    orderTime = date + ' ' + new Date().toLocaleTimeString();
    var orderType = 'MANUAL_BILL';
    var posDate = date;
    var batchID = '';

    var paymentStatus = 'PAID';
    var billingUsername = userName;
    var Status = 'ORST_DELIVERED';
    var totalItems = cartData.length;


    var mocs = await new Promise((resolve,reject)=>{

        db.get('SELECT * FROM MOCS',function(error,data){
            if(error){
                console.log(error)
            }
            else{
                resolve(data)
            }
        })
    })


    var paymentList = adjustedPaymentList

    creditNotesDetailsForPDF = []

    paymentList.map(m=>{
        m['posDate'] = posDate;
        m['orderTime'] = orderTime;
        if(m.paymentType=="PAYMENT_CREDIT_NOTE"){
            creditNotesDetailsForPDF.push(m)
        }
    })

    creditNotesDetailsForPDF.sort((a,b)=>b-a)

    var allDiscountsArray = []
    cartData.map((m,i)=>{
        m.additionalCharges = [];
        m.orderTimeLocal = orderTime;
        m.voidRemarks = '';
        delete m.status;
        m.Status = Status;
        m.isNoCharge = 0;
        m.additionalChargeValues = 0;
        m.voucherID = 0;
        m.timezone = timezone;
        m.orderSubID = i+1;
        if(m.childQuantityOrdered){
            m.quantityOrdered = m.childQuantityOrdered;   
        }
        var discArr = m.discounts
        allDiscountsArray.push(...discArr)
    })
   
    var allAppliedDisounts= []

    discountAppliedIDs.map(a=>{
        var discTotal = 0
        var sDisc = []
        var obj;
        sDisc = allDiscountsArray.filter(b=>b.discountID == a.discountID)
        sDisc.map(c=>{
            discTotal += c.discountPrice
            discTotal = parseFloat(discTotal.toFixed(3))
            obj = {...c,'discountPrice':discTotal}
        })
        if(obj){
            allAppliedDisounts.push(obj)
        }        
    })

    console.log(allAppliedDisounts,'allAppliedDisounts')

    customerInfo = customerData.find(m=>m.customerID == customerID)


    console.log(customerInfo,'customerInfo')

    customerInfo = Object.assign(
        {'address':
        {"ID":-1,
        "addressLine1": customerInfo.address1,
        "addressLine2":customerInfo.address2,
        "addressType":"",
        "city":customerInfo.city,
        "country":customerInfo.country,
        "customerID":customerInfo.customerID,
        "isActive":1,
        "isPrimaryAddress":1,
        "landmark":"",
        "location":"",
        "pincode":customerInfo.pincode,
        "state":customerInfo.state
        },
        "addressList": [], 
        "middleName":"",
        "loyaltyPointsRedeemed" :0,
        
    }, customerInfo)

    console.log(paymentList,'paymentList')

    var salCode = ''

    var orderInformation = {
        chainID:1,
        orderID:orderID,
        currency : "INR",
        currencyCode:"INR",
        timezone:'Asia/Kolkata',
        userName:userName.toString(),
        deviceID,
        netBill:netSale,
        mocID: mocs ? mocs.mocID : 0 ,
        sales,
        source:'DESKTOP',
        paymentStatus:"PAID",
        orderType:"MANUAL_BILL",
        deliveryStatus:"DELIVERED",
        PINumber:'',
        partyCode:partyCode,
        salCode,
        isOrderRounded:1,
        billingUsername:userName,
        loyaltyID:-1,
        loyaltyPointsRedeemed:0,
        posDate:date,
        batchID:'',
        invoiceNumber:invoiceNo,
        discounts:allAppliedDisounts,                    
        discountValue :totalDiscountPrice,
        totalCashDiscount:totalCashDiscount,
        isOpenBill:0,
        openBill:[],
        additionalCharges:[],
        totalProductLevelAdditionalCharges:0,
        totalChargeValue:0,
        isNoCharge:0,
        rounding,
        grossBill:grossSale,
        paymentList,
        refundPayments:[],
        customerIDs:customerID,
        orderCreationTimeLocal:orderTime,
        cashTendered:0,
        changeAmount:0,
        orderRemarks:"",
        numReceiptPrints:1,
        Status:"ORST_DELIVERED",
        productsList:cartData,
        billSettledTimeLocal:orderTime,
        customers:[customerInfo],
        taxes:totalTaxes,
        totalItems
    }
    console.log('orderInformation',orderInformation)
    console.log('customerInfo',customerInfo)

    var orderInformationJson = JSON.stringify(orderInformation);
    var customerInfoJson = JSON.stringify(customerInfo);

    var query = `INSERT INTO OrderInformation (orderID,customerID,customerInfo,childPartyCode,isError,errorMessage,orderTime,orderType,posDate,batchID,netSale,sales,discountValue,grossSale,totalTaxes,rounding,paymentStatus,userName,billingUsername,Status,totalItems,orderInformation) VALUES `
    +
    `('${orderID}',${customerID},'${customerInfoJson}','${partyCode}','${isError}','${errorMessage}','${orderTime}','${orderType}','${posDate}','${batchID}','${netSale}','${sales}','${totalDiscountPrice}','${grossSale}','${totalTaxes}','${rounding}','${paymentStatus}','${userName}','${billingUsername}','${Status}','${totalItems}','${orderInformationJson}')`;
    
    statements.push(query);
        
    var currentInventory,quantityOrderedCost,batchVariantID,productID,quantityAssigned,quantityOrdered;

    for(let i=0;i<cartData.length;i++)
    {

        productID = cartData[i].productID;
        batchVariantID = cartData[i].batchVariantID;
        quantityOrdered = cartData[i].quantityOrdered;
        quantityOrderedCost = cartData[i].batchPrice;

        statements.push(`UPDATE batchProductVariants SET inventory = inventory - ${quantityOrdered}, inventoryCost = inventoryCost - ${quantityOrderedCost} WHERE batchVariantID = ${batchVariantID}`);
        //statements.push(`UPDATE products SET inventoryAmount = inventoryAmount - ${quantityOrdered}, inventoryValue = inventoryValue - ${quantityOrderedCost} WHERE productID = ${productID}`);
    }


    query = `INSERT INTO updatedOrderInformation (orderID,customerID,customerInfo,childPartyCode,isError,orderTime,orderType,posDate,batchID,netSale,sales,discountValue,grossSale,totalTaxes,rounding,paymentStatus,userName,billingUsername,Status,totalItems,orderInformation) VALUES `
    +
    `('${orderID}',${customerID},'${customerInfoJson}','${partyCode}','${isError}','${orderTime}','${orderType}','${posDate}','${batchID}','${netSale}','${sales}','${totalDiscountPrice}','${grossSale}','${totalTaxes}','${rounding}','${paymentStatus}','${userName}','${billingUsername}','${Status}','${totalItems}','${orderInformationJson}')`;
    
    statements.push(query);



    for(let i=0;i<paymentList.length;i++)
    {

        paymentType = paymentList[i].paymentType;
        amount = paymentList[i].amount;
        paymentSubID = paymentList[i].paymentSubID;

        statements.push(`INSERT INTO OrderPayments (orderID,customerID,childPartyCode,paymentSubID,posDate,paymentType,orderTime,amount) VALUES `+
        `('${orderID}',${customerID},'${partyCode}',${paymentSubID},'${posDate}','${paymentType}','${orderTime}','${amount}')`)
    }

    // updation of credit notes

    for(let i=0;i<paymentList.length;i++)
    {
        if(paymentList[i].paymentType == "PAYMENT_CREDIT_NOTE")
        {
            statements.push(`UPDATE creditNotes SET isActive = 0 WHERE creditNoteID = '${paymentList[i].creditNoteID}'`)
        }
    }
    //statements.push(`UPDATE piSummary SET status = 'COMPLETED' WHERE proformaInvoiceID = '${proformaID}'`)
    
    db.runBatchAsync(statements)
    .then((result)=>{
        console.log('success')
        $('#totalBillItems').text(totalUnits)
        $('#totalBillAmount').text(grossSaleRounded)
        $("#myModal4").modal('show');
        noPrint = true
    })
    .catch((error)=>{
        console.log(error)
        var message='Error in creating bill!'
        isError(message,reRenderLocation)
    })
}

sqlite3.Database.prototype.runAsync = function (sql, ...params) {
    return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
    });
    });
};

sqlite3.Database.prototype.runBatchAsync = function (statements) {
    var results = [];
    var batch = ['BEGIN', ...statements, 'COMMIT'];
    console.log(batch,'batch');
    return batch.reduce((chain, statement) => chain.then(result => {
    results.push(result);
    return db.runAsync(...[].concat(statement));
    }), Promise.resolve())
    .catch(err => db.runAsync('ROLLBACK').then(() => Promise.reject(err +
    ' in statement #' + results.length)))
    .then(() => results.slice(2));
};

triggerPrintPdf = (action) => {
    noPrint = false;
    var currentTimestamp = moment().format("YYYYMMDDHHmmss")
 
    $('#myModal4').modal('hide');
    var table1columns = [
        {title: "#", dataKey: "SNo"},
        {title: "Item Name", dataKey: "productName"}, 
        {title: "Quantity", dataKey: "quantityOrdered"},
        {title: "Base Price", dataKey: "productBasePrice"},
        {title: "MRP", dataKey: "MRP"},
        {title: "Discount", dataKey: "discountValues"},
        {title: "CGST", dataKey: "CGST"},
        {title: "SGST", dataKey: "SGST"},
        {title: "Net Amount", dataKey: "productValue"},
        // {title: "Total", dataKey: "totalPrice"}, 
    ];
    
    var table2columns = [
        {title: "GST Tax", dataKey: "nameOnBill"},
        {title: "Taxable Amt", dataKey: "taxalbleAmt"}, 
        {title: "Tax Value", dataKey: "taxValue"},
    ];
    
    var columnsObj ={
        table1columns,
        table2columns
    }
    
    // var tableData = selectedProductData
    var tableData = cartData

    tableData.sort((a,b)=>(a.productID) - (b.productID))

    tableData.map((m,i)=>{
        m['SNo'] = i+1
    })

    var billInfo={
        'billNo':orderID,
        'billTime':orderTime,
        'invoiceNo' :invoiceNo,
    }

    var cashDiscountInfo={
        'cashDiscount':totalCashDiscount,
        'cashDiscPercent':cashDiscPercent,
    }

    var creditNotesInfo={
        'creditNotesAdjust':sum,
        'payableAmnt':cash,
        'creditNotesDetails' : creditNotesDetailsForPDF
    }

    var orderInfo={
        'totalPrice' : grossSaleRounded,
        'discountValue': totalDiscountPrice,
        'totalItems' : tableData.length,
        'rounding' : rounding,
    }
    
    if(totalCashDiscount){
        orderInfo['cashDiscountInfo'] = cashDiscountInfo
    }

    if(creditNotesAdjusted){
        orderInfo['creditNotesInfo'] = creditNotesInfo
    }

    var docInfo = {
        'action':action,
        'title' : 'Tax invoice',
        'storeInfoShown' :true,
        'billInfo':billInfo,
        'retailerInfo' :customerInfo,
        'orderInfo' : orderInfo,
        'taxShown': true,
        'reRenderLocation':reRenderLocation,
        'fileName' : `${orderID}_${currentTimestamp}.pdf`
    }
 
    printPdf(columnsObj,tableData,docInfo) 
};

closeModal=(id)=>{
    $(`#${id}`).modal('hide');
    generateBillDisabled = false
}

$("#successModal").on("hidden.bs.modal", function () {
    window.location.href= reRenderLocation
})

$("#myModal4").on("hidden.bs.modal", function () {
    if(noPrint){
        window.location.href= reRenderLocation
    }
})