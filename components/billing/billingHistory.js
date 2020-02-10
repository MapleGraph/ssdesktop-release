var isOpen =false;
var isButtonClicked = false;
var  currDate;
var productsList = [];
var dataTime;
var customerData=[];
var selectedOrderInfoData=[]
var orderID ;
var cash = 0;
var sum = 0;
var creditNotesDetails = []

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='billingDashboard.html'

$(async()=>{  
    await getMenu('Billing History')
    await backNavigation()
  
    // currDate = currDate.split("-")
    // currDate = currDate[1]+'/'+currDate[2]+'/'+currDate[0]
    currDate = new Date().toDateInputValue()
    getHistory('all')
})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function getHistory(type){
    var fromValue = $('#fromDate').val();
    var toValue = $('#toDate').val();

    // fromValue = fromValue.split("/").reverse().join("-");
    // toValue = toValue.split("/").reverse().join("-");
  
    if((fromValue == "" ||toValue == "")  && type!="all" ){
        var message = 'Please fill date field!'
        isError(message)
    }
    else if(fromValue>toValue){
        $('#fromDate').val(currDate);
        $('#toDate').val(currDate);
        var message ='Select valid interval!'
        isError(message)
    }
    else{
        if(type=="all"){
            var query = `SELECT * FROM OrderInformation`
            db.all(query,function(err, data) {
                if(err){
                    console.log(err)
                    isError(fetchingErrMsg,reRenderLocation)
                }
                else{ 
                    console.log(data,'allData')

                    placedOrdersList =data;
                    placedOrdersList.map(m=>{
                        var orderInfoData = JSON.parse(m.orderInformation)
                        console.log(orderInfoData,'orderInfoData')
                        if(orderInfoData.customers && orderInfoData.customers.length){
                            m['storeName'] = orderInfoData.customers[0].firstName;
                        }
                        m['grossBill'] = orderInfoData.grossBill;
                        var time = (orderInfoData.billSettledTimeLocal).split(" ")
                        m['billSettledTimeLocal'] = time[1]

                    })
                    placedOrdersList.sort((a,b)=>new Date(b.posDate) - new Date(a.posDate))
                    $('#placedOrdersList').bootstrapTable('destroy')
                    $('#placedOrdersList').bootstrapTable({
                        data:placedOrdersList,
                        search:true,
                        reinit: true,
                        trimOnSearch:false,
                        pagination:true
                    });
                    if(placedOrdersList.length <=0){
                       $(".no-records-found td").text("No Stock Available to return") 
                    }
                    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                    $('.customInputSearchDiv').addClass('flex-row margin-20')
                }
            })
        }
        else{
            var query = `SELECT * FROM OrderInformation WHERE DATE(OrderInformation.posDate) BETWEEN '${fromValue}' AND '${toValue}' ORDER BY OrderInformation.posDate DESC`
            db.all(query,function(err, data) {
                if(err){
                    console.log(err)
                    isError(fetchingErrMsg,reRenderLocation)
                }
                else{ 
                    console.log(data,'selectedData')
                    placedOrdersList =data;
                    placedOrdersList.map(m=>{
                        var orderInfoData = JSON.parse(m.orderInformation)
                        console.log(orderInfoData,'orderInfoData')
                        if(orderInfoData.customers && orderInfoData.customers.length){
                            m['storeName'] = orderInfoData.customers[0].firstName;
                        }
                        m['grossBill'] = orderInfoData.grossBill;
                        var time = (orderInfoData.billSettledTimeLocal).split(" ")
                        m['billSettledTimeLocal'] = time[1]

                    })
                    $('#placedOrdersList').bootstrapTable('destroy')
                    $('#placedOrdersList').bootstrapTable({
                        data:placedOrdersList,
                        search:true,
                        reinit: true,
                        trimOnSearch:false,
                        pagination:true
                    });
                    if(placedOrdersList.length <=0){
                        $(".no-records-found td").text("No Stock Available to return") 
                     }
                    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                    $('.customInputSearchDiv').addClass('flex-row margin-20')
                }
            })
        }
    }

}

renderPopover=(value,row)=>{
    return `<div style="position:relative"  id='${row.orderID}' onclick="showPopover('${row.orderID}',this)" class ="customViewButton"> <img src="../../assets/img/ic-more-vertical-gray.png" /> </div>`
}

$('body').click(()=>{
    if(isOpen && isButtonClicked == false){
        $(".popoverDiv").remove();
        isOpen=false;
    }else if(isOpen && isButtonClicked == true){
        isButtonClicked = false;
    }
})

function showPopover(orderID,el){
    const rect = el.getBoundingClientRect();

    var positionObj =  {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };

    isOpen= true;
    isButtonClicked = true;
    $(".popoverDiv").remove();

    
    db.all(`SELECT orderInformation FROM OrderInformation WHERE orderID = '${orderID}'`,function(err, row) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(row.length){
                console.log(row,'row')
                orderInfo = row[0].orderInformation;
                parsedOrderInfoDetail = JSON.parse(orderInfo);
                if(positionObj.top > 800){
                    $("#"+orderID).append(`<div class='popoverDiv popoverPosition'>
                    <span class="popoverSpan"  onclick="getBillingList('${orderID}','')"><img class="popoverIcon" src="../../assets/img/download_grey.png" /> <small>Download</small></span>
                    <span class="popoverSpan"  onclick="getBillingList('${orderID}','print')"><img class="popoverIcon" src="../../assets/img/print_grey.png" /> <small>Print</small></span>
                    <a class="popoverSpan" href="billingHistoryDetails.html?orderID=${orderID}"><img class="popoverIcon" src="../../assets/img/view_icon.png" /> <small>View</small></a></div>`);
                }
                else {
                    $("#"+orderID).append(`<div class="popoverDiv">
                    <span class="popoverSpan"  onclick="getBillingList('${orderID}','')"><img class="popoverIcon" src="../../assets/img/download_grey.png" /> <small>Download</small></span>
                    <span class="popoverSpan"  onclick="getBillingList('${orderID}','print')"><img class="popoverIcon" src="../../assets/img/print_grey.png" /> <small>Print</small></span>
                    <a class="popoverSpan" href="billingHistoryDetails.html?orderID=${orderID}"><img class="popoverIcon" src="../../assets/img/view_icon.png" /> <small>View</small></a></div>`);
                }
                if(parsedOrderInfoDetail.Status != "ORST_CANCELLED"){
                    $(`#${orderID} > .popoverDiv`).append(`
                    <a class="popoverSpan" href="newReturn.html?oID=${orderID}"><img class="popoverIcon" src="../../assets/img/return.png" /> <small>Return</small></a>`);    
                }	
            }
        }

    })  
	  
}

getBillingList=(oID,action)=>{
    productsList = []
    placedOrdersList.map(m=>{
        if(oID == m.orderID){
            orderID = oID
            selectedOrderInfoData = JSON.parse(m.orderInformation)
            productsList =  selectedOrderInfoData.productsList
            productsList.map((m,i)=>{
                m['SNo']= i+1;
            })
            
            var paymentDetails = selectedOrderInfoData.paymentList

            creditNotesDetails = paymentDetails.filter(m=>m.paymentType == "PAYMENT_CREDIT_NOTE")

            if(creditNotesDetails.length){
                sum = 0
                cash = 0
                paymentDetails.map(m=>{
                    if(m.paymentType =="PAYMENT_CASH"){
                        cash = m.amount
                    }
                    else if(m.paymentType == "PAYMENT_CREDIT_NOTE"){
                        sum += m.amount
                    }
                })
            }

            dataTime =  (selectedOrderInfoData.billSettledTimeLocal).split(" ")
            if(dataTime && dataTime.length){
                $('#orderDate').text(dataTime[0]);
                $('#orderTime').text(dataTime[1]);
            }
            if( selectedOrderInfoData.customers && selectedOrderInfoData.customers.length){
                customerData = selectedOrderInfoData.customers[0]
            }
        }
    })
    triggerPrintPdf(productsList,action)
}


triggerPrintPdf = (productsList,action) => {
    var currentTimestamp = moment().format("YYYYMMDDHHmmss")
    var table1columns = [
        {title: "S.No.", dataKey: "SNo"},
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

    var tableData = productsList
    var orderInfoDetail = selectedOrderInfoData


    var billInfo={
        'billNo':orderInfoDetail.orderID,
        'billTime':orderInfoDetail.billSettledTimeLocal,
    }
  
    var orderInfo={
        'totalPrice' : orderInfoDetail.grossBill,
        'discountValue': orderInfoDetail.discountValue,
        'rounding' : orderInfoDetail.rounding,
        'totalItems' : tableData.length,
    }
    
    var creditNotesInfo={
        'creditNotesAdjust':sum,
        'payableAmnt':cash,
        'creditNotesDetails' : creditNotesDetails
    }

    if(creditNotesDetails.length){
        orderInfo['creditNotesInfo'] = creditNotesInfo
    }
    var docInfo = {
        'action' : action,
        'title' : 'Tax invoice',
        'storeInfoShown' :true,
        'billInfo':billInfo,
        'retailerInfo' :customerData,
        'orderInfo' : orderInfo,
        'taxShown': true,
        'fileName' : `${orderID}_${currentTimestamp}.pdf`
    }

     printPdf(columnsObj,tableData,docInfo) 

    // if(type){
    //     $('#successTag').text('Print')
    //     $('#successTagl').text('printed')
    //     $('.fileName').text(`${orderID}.pdf`)
    //     $('#successModal').modal('show');
    //     $('#fileLocation').css('display','none')
    // }
    // else if(status){
    //     $('#successTag').text('Download')
    //     $('#successTagl').text('downloaded')
    //     $('.fileName').text(`${orderID}.pdf`)
    //     $('#successModal').modal('show');
    // }
};

closeModal=()=>{
    $(`#successModal`).modal('hide');
}