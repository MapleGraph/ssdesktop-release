var userID = store.userID

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='billingDashboard.html'

var allDiscountsOutletData;
var discountDataList;
var customerData;
var editedDiscountData = {};
var oldStoreList;

$(document).ready(async()=>{
    await getMenu('Manage discount')
    await backNavigation()

})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}

getData=async()=>{
    await allCustomersData()
    await getCustomerDropdown('outletList')
    await getDiscountListData()
    await getOutletData()
}

initiateMultiSelect=async(id)=>{

    $('#outletList,#outletListEdit').multiselect('destroy');
    $('#outletList,#outletListEdit').multiselect({
        enableCaseInsensitiveFiltering: true,
        includeSelectAllOption: true,
        trimOnSearch:false,
        maxHeight: 500,
        maxwidth:300,
        dropUp: false
    })
    $('.input-group').css('display','flex')
    $('.multiselect').attr('title','')

    $('.customInputGroupAddon').addClass('flex-row')
    $('.customInputGroupAddon').css({'width':'5%','justify-content':'center'})
    $('.customSearchTableImage').css({'width':'15px'})

    $('.customMultiSelectSearch').css({'margin-top':0,'width':'90%'})

    $('.input-group-btn').addClass('flex-row')
    $('.input-group-btn').css({'width':'5%'})

    $('.multiselect-clear-filter').addClass('flex-row')
    $('.multiselect-clear-filter').css({'width':'100%','height':'35px','margin-top':'0','justify-content':'center'})
    $('.customSearchTableImage1').css({'height':'15px','width':'15px'})
}

allCustomersData=async()=>{

    customerData = await new Promise(async(resolve,reject)=>{

        var query = `SELECT * FROM customers WHERE isMappedToSS = 0`

        db.all(query,function(error,data){
            if(error){
                console.log(error)
            }
            else{
                resolve(data);
                
            }
        })

    })
}

getCustomerDropdown=async(id)=>{
    $('#'+id).html('');
    if(customerData.length){
        for(let i=0;i<customerData.length;i++)
        {
            customerName = customerData[i].firstName;
            customerValue = customerData[i].customerID;                        
            element = '<option value='+customerValue+' name='+customerName+' >'+customerName+'</option>'                             
            $('#'+id).append(element);
        }    
    }
    await initiateMultiSelect(id)
}

getDiscountListData=async()=>{

    discountDataList = await new Promise((resolve,reject)=>{
        var query = `SELECT * FROM discountMaster WHERE isCashDiscount = 1`
        db.all(query,function(error,data){
            if(error){
                console.log(error)
            }
            else{
                resolve(data);
            }
        })
    })
    
    discountDataList.map((m,i)=>{
        m['sno'] = i+1
        return m    
    })

    console.log(discountDataList,'discountDataList')
    $('#discountList').bootstrapTable('destroy')
    $('#discountList').bootstrapTable(
        {
            data:discountDataList,
            search:false,
            reinit: true,
            trimOnSearch:false,
            pagination:true
        }
    );
}

getOutletData=async()=>{
    allDiscountsOutletData = await new Promise((resolve,reject)=>{
        var query = `SELECT * FROM discountCustomerMap WHERE isActive = 1`
        db.all(query,function(error,data){
            if(error){
                console.log(error)
            }
            else{
                resolve(data);
            }
        })
    })
}

renderOutletList=(value,row)=>{

    return `<button type = "button" id="viewOutletBtn${row.discountID}" onclick="viewOutlet(${row.discountID})" class ="btnWhite">View Outlet</button>`
}


renderActionButton=(value,row)=>{
    return `<div>
        <img onclick="editDiscount(${row.discountID})" src = "../../assets/img/edit_icon.png">
        <img onclick="deleteDiscount(${row.discountID})" src = "../../assets/img/trash-gray.png">
    </div>`
}

viewOutlet= async(discID)=>{
    var selectedOutlet = allDiscountsOutletData.filter(m=>m.discountID == discID)
    var filteredOutletData = []    
    filteredOutletData = customerData.filter(o2 => selectedOutlet.some(o1 => o1.customerID== o2.customerID));

    console.log(filteredOutletData,'filteredOutletData')

    $('#outletListTable').bootstrapTable('destroy')
    $('#outletListTable').bootstrapTable(
        {
            data:filteredOutletData,
            search:false,
            reinit: true,
            trimOnSearch:false,
            pagination:true
        }
    );

    $('#outletListModal').modal('show');
    selectedDiscDetails = discountDataList.find(m=>m.discountID==discID)
    if(selectedDiscDetails){
        $('#outletDiscDetail').text(`( ${selectedDiscDetails.discountName} - ${selectedDiscDetails.discountValue}% )`);
    }
}

deleteDiscount=async(discountID)=>{
    const dialogOptions = {type: 'info', buttons: ['Cancel', 'OK'], message: 'Are you sure you want to delete?'}
    dialog.showMessageBox(dialogOptions, async i => {
        if(i){
            loader(1)
            let response =  await deleteByChain('deleteDiscount',discountID)
            console.log(response,'response')
            if(response.data.status){
                await syncDiscounts()
                await getData()
                loader(0)
                $('#successTag').text('deleted');
                $('#successModal').modal('show');
            }
            else{
                isError('Error in deleting discount')
                loader(0) 
            }
        }
    })
}

editDiscount= async(discID)=>{
    $('#editModal').modal('show');
    $('#discId').val(discID);
    editedDiscountData = {};
    oldStoreList = "";
    
    await getCustomerDropdown('outletListEdit')
    selectedDiscDetails = discountDataList.find(m=>m.discountID==discID)
    editedDiscountData = selectedDiscDetails
    
    if(selectedDiscDetails){
        $('#discountNameEdit').val(selectedDiscDetails.discountName)
        $('#discountPercentEdit').val(selectedDiscDetails.discountValue)
    }
    
    var selectedOutlet = allDiscountsOutletData.filter(m=>m.discountID == discID)
    
    filteredOutletCustomers = selectedOutlet.map(m=> m['customerID'] =  m.customerID)
    
    oldStoreList = filteredOutletCustomers.toString();
    $('#outletListEdit').val(filteredOutletCustomers);
    $("#outletListEdit").multiselect("refresh");
    
}

addDiscount=()=>{
    $("#addModal").modal('show');
    $('#discountName').val('')
    $('#discountPercent').val('')
    $('#outletList').val('');
    getCustomerDropdown('outletList')
}

validateQuantity=(event,id)=>{
    var value = event.target.value
    if(value>100){
        $('#'+id).val('100') 
        return false
    }
    var regexp = /^(\d{1,2})(\.\d{1,2})?$/
    var t = regexp.test(value)
    console.log(t)
    if(!t){
        var inputValue = parseFloat(value);
        var roundedValue = inputValue.toFixed(2)
        $('#'+id).val(roundedValue)  
        return false
    }
}

saveAddModal=async()=>{
    var discName = $('#discountName').val()

    var discValue = $('#discountPercent').val()
    var inputValue = parseFloat(discValue);
    var roundedValue = inputValue.toFixed(2)
    $('#discountPercent').val(roundedValue) 

    var outletID = $('#outletList').val();
    console.log(discName,discValue,outletID)

    if(discName=="" && discValue=="" && outletID =="" ){
        isError('Please fill all fields!')
        return false
    }
    else{
        if(discName==""){
            isError('Please fill discount name!')
            return false
        }
        if(discValue=="" || discValue==0){
            $('#discountPercent').val('')
            isError('Please fill valid discount percentage!')
            return false
        }
        if(discValue>100 || discValue<=0){
            $('#discountPercent').val('')
            isError('Invalid discount value')
            return false
        }
        if(outletID==""){
            isError('Please select atleast 1 outlet!')
            return false
        }
    }

   var isValidSingleCustomer = validateSingleCustomer(outletID,'outletList')

   if(isValidSingleCustomer){
       var discDetails = {
           discName,
           discValue,
           outletID
       }   
       addDiscountApiCall(discDetails)
   }
}

validateSingleCustomer=(outletID,id,discID)=>{
    var custEligibleDiscounts = []
    var custList = []
    err = false;
    outletID.map(m=>{
        custEligibleDiscounts = allDiscountsOutletData.filter(n=>n.customerID == m)
        if(custEligibleDiscounts.length){
            var isCashDiscountForCust = []
            custEligibleDiscounts.map(m=>{
                if(m.discountID != discID){
                    isCashDiscountForCust = discountDataList.filter(n=>n.discountID == m.discountID && n.isCashDiscount==1)
                }
            })
            if(isCashDiscountForCust.length){
                var custObj = customerData.find(n=>n.customerID == m)
                var custName = custObj.firstName
                custList.push(custName)
                err = true
            }
        }
    })

    if(err){
        custList = custList.toString()
        isError(`Cash discount is already added for ${custList}`)
        $('#'+id).val('');
        getCustomerDropdown(id)
        return false
    }
    return  true ;
} 

saveEditModal=async()=>{
    var discName = $('#discountNameEdit').val()

    var discValue = $('#discountPercentEdit').val()
    var inputValue = parseFloat(discValue);
    var roundedValue = inputValue.toFixed(2)
    $('#discountPercentEdit').val(roundedValue) 

    var outletID = $('#outletListEdit').val();
    var discID = $('#discId').val()
    console.log(discName,discValue,outletID)

    if(discName=="" && discValue=="" && outletID =="" ){
        isError('Please fill all fields!')
        return false
    }
    else{
        if(discName==""){
            isError('Please fill discount name!')
            return false
        }
        if(discValue=="" || discValue==0){
            $('#discountPercentEdit').val('')
            isError('Please fill valid discount percentage!')
            return false
        }
        if(discValue>100 || discValue<=0){
            $('#discountPercentEdit').val('')
            isError('Invalid discount value')
            return false
        }
        if(outletID==""){
            isError('Please select atleast 1 outlet!')
            return false
        }
    }

    var isValidSingleCustomer = validateSingleCustomer(outletID,'outletListEdit',discID)

    if(isValidSingleCustomer){
        var discDetails = {
            discID,
            discName,
            discValue,
            outletID
        }
        editDiscountApiCall(discDetails,editedDiscountData)
    }
} 

addDiscountApiCall=async(discDetails)=>{

    //var timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
    var timezone="Asia/Kolkata";
    var startDateLocal = moment().format("YYYY-MM-DD HH:mm:ss");

    var endDateLocal = moment().add(1, 'months').format("YYYY-MM-DD HH:mm:ss");

    var mocReference = moment().format("MM/DD");

    var outletIDs = (discDetails.outletID).toString()

    var data ={
        "discountName":discDetails.discName,
        "discountType":"PERCENTAGE",
        "discountValue":discDetails.discValue,
        "isTaxed":"1",
        "isAutoApplied":0,
        "discountLevel":"PRODUCT",
        "isPasswordEnabled":0,
        "maximumOff":"0.00",
        "maxDiscountRepetition":"0",
        "minimumProductsRequired":1,
        "isShownBeyondTimeLimit":1,
        "isVoucherEnabled":0,
        "isSlotted":0,
        "minimumAmount":"0.0000",
        "targetProductList":"",
        "targetProductNum":"",
        "applyDiscToTargetProductList":0,
        "isAppliedToBaseProductOnly":0,
        "activityID":"CASH_DISCOUNT",
        "activityCode":"CASH_DISCOUNT",
        "activityType":"STPR",
        "activityClassification":"STPR",
        "mocReference":mocReference,
        "schemeType":"ITEM",
        "itemListDivision":"ALL",
        "itemListPC":"ALL",
        "groupingForScheme":"ALL",
        "QPSOrAcrossInvoices":"N",
        "linesInBill":"N",
        "claimedAs":"AMOUNT",
        "itemListID":"ALL",
        "itemListBrand":"ALL",
        "itemListItemVariant":"ALL",
        "itemListSKUCodes":"ALL",
        "itemListLot":"ALL",
        "primaryChannel":"ALL",
        "secondaryChannel":"ALL",
        "classification":"ALL",
        "mOutletType":"ALL",
        "category":"ALL",
        "userID":userID,
        "startDateLocal":startDateLocal,
        "endDateLocal":'',
        "timezone":timezone,
        "discountCustomers": [
        {
          "storeID": storeID,
          "customers": outletIDs
        },
      ]   
    }

    loader(1)

    console.log(data,'data')

    var response = await postByChain('addDiscount',data)
    
    console.log(response,'response')

    if(response.data.status){
        $('#addModal').modal('hide');
        await syncDiscounts()
        await getData()
        loader(0)
        $('#successTag').text('created')
        $('#successModal').modal('show');
    }
    else{
        loader(0) 
        $('#addModal').modal('hide');
        if(response.data.message){
            isError(response.data.message)
        }
        else{
            isError('Error in creating new discount')
        }
        return false
    }
}


editDiscountApiCall=async(discDetails,editedDiscountData)=>{

    var outletIDs = (discDetails.outletID).toString()

    var data ={
        "discountID" : discDetails.discID,
        "discountName":discDetails.discName,
        "discountType":"PERCENTAGE",
        "discountValue":discDetails.discValue,
        "isTaxed":"1",
        "isAutoApplied":0,
        "discountLevel":"PRODUCT",
        "isPasswordEnabled":0,
        "maximumOff":"0.00",
        "maxDiscountRepetition":"0",
        "minimumProductsRequired":1,
        "isShownBeyondTimeLimit":1,
        "isVoucherEnabled":0,
        "isSlotted":0,
        "minimumAmount":"0.0000",
        "targetProductList":"",
        "targetProductNum":"",
        "applyDiscToTargetProductList":0,
        "isAppliedToBaseProductOnly":0,
        "activityID":"CASH_DISCOUNT",
        "activityCode":"CASH_DISCOUNT",
        "activityType":"STPR",
        "activityClassification":"STPR",
        "mocReference":'',
        "schemeType":"ITEM",
        "itemListDivision":"ALL",
        "itemListPC":"ALL",
        "groupingForScheme":"ALL",
        "QPSOrAcrossInvoices":"N",
        "linesInBill":"N",
        "claimedAs":"AMOUNT",
        "itemListID":"ALL",
        "itemListBrand":"ALL",
        "itemListItemVariant":"ALL",
        "itemListSKUCodes":"ALL",
        "itemListLot":"ALL",
        "primaryChannel":"ALL",
        "secondaryChannel":"ALL",
        "classification":"ALL",
        "mOutletType":"ALL",
        "category":"ALL",
        "userID":userID,
        "startDateLocal":editedDiscountData.startDateLocal,
        "endDateLocal":editedDiscountData.endDateLocal,
        "timezone":editedDiscountData.timezone,
        "oldStoreList":oldStoreList,
        "discountCustomers": [
        {
          "storeID": storeID,
          "customers": outletIDs
        },
      ]   
    }

    console.log(data,'data')
    loader(1)
    var response = await postByChain('editDiscount',data) 
    console.log(response,'response')

    if(response.data.status){
        $('#editModal').modal('hide');
        await syncDiscounts()
        await getData()
        loader(0)
        $('#successTag').text('edited')
        $('#successModal').modal('show');
    }
    else{        
        loader(0) 
        $('#editModal').modal('hide');
        if(response.data.message){
            isError(response.data.message)
        }
        else{
            isError('Error in updating discount')
        }
        return false
    }
}

closeModal=(modalID)=>{
    $(`#${modalID}`).modal('hide');
}