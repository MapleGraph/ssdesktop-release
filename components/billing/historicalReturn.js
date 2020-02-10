var isOpen =false;
var isButtonClicked = false;
var  currDate;
var refundsList = [];
var dataTime;
var customerData=[];
var selectedOrderInfoData=[]
var orderID;
var cash = 0;
var sum = 0;
var creditNotesDetails = []

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='billingDashboard.html'

$(async()=>{  
    await getMenu('Historical Returns')
    await backNavigation()
 
    // currDate = currDate.split("-")
    // currDate = currDate[1]+'/'+currDate[2]+'/'+currDate[0]
    currDate = new Date().toDateInputValue()
    getReturns('all')
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

function getReturns(type){
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
            var query = `SELECT * FROM VoidOrderInformation`
            db.all(query,function(err, data) {
                if(err){
                    console.log(err)
                    isError(fetchingErrMsg,reRenderLocation)
                }
                else{ 
                    console.log(data,'allData')

                    placedOrdersList = data;
                    placedOrdersList.map(m=>{

                        var orderInfoData = (JSON.parse(m.orderInformation))
                        
                        if(orderInfoData.orderJSON){
                            orderInfoData = orderInfoData.orderJSON;
                        }

                        m['returnID'] = orderInfoData.refundOrderID
                        
                        if(orderInfoData.customers && orderInfoData.refundSettledTime){
                            m['storeName'] = orderInfoData.customers[0].firstName
                            var time = (orderInfoData.refundSettledTime).split(" ")
                            m['refundSettledTime'] = time[1]
                        }
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
                    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                    $('.customInputSearchDiv').addClass('flex-row margin-20')
                }
            })
        }
        else{
            var query = `SELECT * FROM VoidOrderInformation WHERE DATE(VoidOrderInformation.posDate) BETWEEN '${fromValue}' AND '${toValue}' ORDER BY VoidOrderInformation.posDate DESC`
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
                        if(orderInfoData){
                            m['returnID'] = orderInfoData.refundOrderID
                            if(orderInfoData.customers && orderInfoData.customers.length){
                                m['storeName'] = (orderInfoData.customers[0]).firstName
                            }
                            var time = (orderInfoData.refundSettledTime).split(" ")
                            m['refundSettledTime'] = time[1]
                        }

                    })
                    $('#placedOrdersList').bootstrapTable('destroy')
                    $('#placedOrdersList').bootstrapTable({
                        data:placedOrdersList,
                        search:true,
                        reinit: true,
                        trimOnSearch:false,
                        pagination:true
                    });
                    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                    $('.customInputSearchDiv').addClass('flex-row margin-20')
                }
            })
        }
    }

}

renderPopover=(value,row)=>{
    return `<div style="position:relative"  id='${row.ID}' onclick="showPopover('${row.ID}','${row.orderID}',this)" class ="customViewButton"> <img src="../../assets/img/ic-more-vertical-gray.png" /> </div>`
}

$('body').click(()=>{
    if(isOpen && isButtonClicked == false){
        $(".popoverDiv").remove();
        isOpen=false;
    }else if(isOpen && isButtonClicked == true){
        isButtonClicked = false;
    }
})

function showPopover(ID,orderID,el){
    const rect = el.getBoundingClientRect();

    var positionObj =  {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };

    isOpen= true;
    isButtonClicked = true;
    $(".popoverDiv").remove();

    db.all(`SELECT orderInformation FROM VoidOrderInformation WHERE ID = '${ID}'`,function(err, row) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(row.length){
                console.log(row,'row')
                orderInfo = JSON.parse(row[0].orderInformation);

                if(orderInfo.orderJSON){
                    console.log('order json')
                    parsedOrderInfoDetail = orderInfo.orderJSON;
                }
                else{
                    parsedOrderInfoDetail = orderInfo;
                }
                

                if(positionObj.top > 800){
                    $("#"+ID).append(`<div class='popoverDiv popoverPosition'>
                    <span class="popoverSpan"  onclick="getRefundList('${ID}','')"><img class="popoverIcon" src="../../assets/img/download_grey.png" /> <small>Download</small></span>
                    <span class="popoverSpan"  onclick="getRefundList('${ID}','print')"><img class="popoverIcon" src="../../assets/img/print_grey.png" /> <small>Print</small></span>
                    <a class="popoverSpan" href="historicalReturnDetails.html?orderID=${ID}"><img class="popoverIcon" src="../../assets/img/view_icon.png" /> <small>View</small></a></div>`);
                }
                else {
                    $("#"+ID).append(`<div class="popoverDiv">
                    <span class="popoverSpan"  onclick="getRefundList('${ID}','')"><img class="popoverIcon" src="../../assets/img/download_grey.png" /> <small>Download</small></span>
                    <span class="popoverSpan"  onclick="getRefundList('${ID}','print')"><img class="popoverIcon" src="../../assets/img/print_grey.png" /> <small>Print</small></span>
                    <a class="popoverSpan" href="historicalReturnDetails.html?orderID=${ID}"><img class="popoverIcon" src="../../assets/img/view_icon.png" /> <small>View</small></a></div>`);
                }
                if(parsedOrderInfoDetail.Status == "ORST_PARTIAL_CANCELLED"){
                        $(`#${ID} > .popoverDiv`).append(`
                        <a class="popoverSpan" href="newReturn.html?oID=${orderID}&historicalReturn"><img class="popoverIcon" src="../../assets/img/return.png" /> <small>Return</small></a>`);
                        
                }	
            }
        }

    })  
}

getRefundList=(ID,action)=>{
    refundsList = []
    placedOrdersList.map(m=>{
        if(ID == m.ID){
            selectedOrderInfoData = JSON.parse(m.orderInformation)
            if(selectedOrderInfoData.orderJSON){
                selectedOrderInfoData = selectedOrderInfoData.orderJSON;
            }
            orderID = selectedOrderInfoData.orderID;
            refundsList =  selectedOrderInfoData.refundsList
            refundsList.map((n,i)=>{
                n['SNo']= i+1;
                n['price']=parseFloat(n.productBasePrice).toFixed(2)
                n['totalPrice']= parseFloat(n.voidQuantity * n.productBasePrice).toFixed(2)
            })
            var paymentDetails = selectedOrderInfoData.refundPayments;

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
            dataTime =  (selectedOrderInfoData.voidTimeLocal).split(" ")
            $('#orderDate').text(dataTime[0]);
            $('#orderTime').text(dataTime[1]);
            customerData = selectedOrderInfoData.customers[0]
        }
    })
    triggerPrintPdf(refundsList,action)
}

triggerPrintPdf = (refundsList,action) => {
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
        {title: "Net Amount", dataKey: "totalPrice"},
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

    refundsList.map((m,i)=>{
        m['SNo']= i+1;
        m['price']=parseFloat(m.productBasePrice).toFixed(2)
        m['totalPrice']= parseFloat(m.voidQuantity * m.productBasePrice).toFixed(2)
        var taxArr = m.taxes
        taxArr.map(n=>{
            var taxLabel = n.taxName.split('@')
            m[`${taxLabel[0]}`] = n.taxValue
        })
    })

    console.log(refundsList,'refundsList',selectedOrderInfoData,'selectedOrderInfoData')

    var tableData = refundsList
    var orderInfoDetail = selectedOrderInfoData

    var totalPrice = parseFloat(orderInfoDetail.refundNetBill+orderInfoDetail.refundTaxes).toFixed(3)

    var billInfo={
        'billNo':orderInfoDetail.orderID,
        'billTime':orderInfoDetail.refundSettledTime,
    }

    var orderInfo={
        'totalPrice' : totalPrice,
        'discountValue': orderInfoDetail.discountValue,
        'totalItems' : tableData.length,
        'rounding' : orderInfoDetail.rounding,
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
        'billInfo' : billInfo,
        'orderInfo': orderInfo,
        'retailerInfo' :customerData,
        'storeInfoShown' :true,
        'taxShown': true,
        'fileName' : `${orderID}_${currentTimestamp}.pdf`
    }

    console.log(docInfo,'docInfo')

    printPdf(columnsObj,tableData,docInfo) 

    // if(type){
    //     $('#successTag').text('Print')
    //     $('#successTagl').text('printed')
    //     $('.fileName').text(`historicalReturns.pdf`)
    //     $('#successModal').modal('show');
    //     $('#fileLocation').css('display','none')
    // }
    // else if(status){
    //     $('#successTag').text('Download')
    //     $('#successTagl').text('downloaded')
    //     $('.fileName').text(`historicalReturns.pdf`)
    //     $('#successModal').modal('show');
    // }
};

closeModal=()=>{
    $(`#successModal`).modal('hide');
}