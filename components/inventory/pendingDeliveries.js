var isOpen =false;
var isButtonClicked = false;
var currDate;
var parsedPoDetail = [];
var poSummaryData=[];


var totalPrice;
var totalItems;
var dataTime;
var vendorDetail;
var subTotal; 
var totalTax ;
var unipaySchemeAdj;
var creditNoteAdj;
var debitNoteAdj ;
var purchaseOrderID;
var stockReference;

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='inventoryDashboard.html'

$(async()=>{
    await getMenu('Pending Deliveries')
    await backNavigation()
  
    currDate = new Date().toDateInputValue()
    // currDate = currDate.split("-")
    // currDate = currDate[1]+'/'+currDate[2]+'/'+currDate[0]
    getPendingDeliveries('all')
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


function getPendingDeliveries(type){
    
    var fromValue = $('#fromDate').val();
    var toValue = $('#toDate').val();

    // fromValue = fromValue.split("/").reverse().join("-");
    // toValue = toValue.split("/").reverse().join("-");

    console.log(fromValue,toValue)

    if((fromValue == "" ||toValue == "")  && type!="all" ){
        var message ='Please fill date field!'
        isError(message)
    }
    else if(fromValue>toValue){
        $('#fromDate').val(currDate);
        $('#toDate').val(currDate);
        var message ='Select valid interval!'
        isError(message)
    }
    else{
        db.all('SELECT *  FROM vendors',(err,data)=>{
            if(err){
                console.log(err)
                 isError(fetchingErrMsg,reRenderLocation)
            }
            else{                
                var vendorDetail = data[0]
    
                db.all(`SELECT * from poSummary WHERE status LIKE 'RECEIVED'`,(err,poData)=>{
                    if(err){
                        console.log(err)
                         isError(fetchingErrMsg,reRenderLocation)
                    }
                    else{ 
                        console.log(poData,'poData')
                        parsedPoProdData = poData.map(m=>{
                            return JSON.parse(m.json);
                        })
            
                        poSummary = parsedPoProdData.map(m=>{
                            let dateData = m.purchaseOrderSummary[0].orderCreationTimeLocal.split(" ")
                            m.purchaseOrderSummary[0]['orderDate'] = dateData[0]
                            m.purchaseOrderSummary[0]['orderTime'] = dateData[1]
                            m.purchaseOrderSummary[0]['vendorGUID'] = vendorDetail.vendorGUID
                            m.purchaseOrderSummary[0]['itemCount'] = m.purchaseOrderDetail.length
                            // return m[0]
                            return m.purchaseOrderSummary[0]
                        })
                        console.log(parsedPoProdData,'parsedPoProdData')
                        console.log(poSummary,'poSummary')
                        if(type == "all"){  
                            $('#pendingDeliveriesList').bootstrapTable('destroy')
                            $('#pendingDeliveriesList').bootstrapTable({
                                data:poSummary,
                                search:true,
                                reinit: true,
                                trimOnSearch:false,
                                pagination:true
                            });
                            $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                            $('.customInputSearchDiv').addClass('flex-row margin-20')
                        }
                        else{
                            filteredParsedPoData = poSummary.filter(m=> m.orderDate >= fromValue && m.orderDate <= toValue )
                            console.log(filteredParsedPoData,'filteredParsedPoData')            
                            $('#pendingDeliveriesList').bootstrapTable('destroy')
                            $('#pendingDeliveriesList').bootstrapTable({
                                data:filteredParsedPoData,
                                search:true,
                                reinit: true,
                                trimOnSearch:false,
                                pagination:true
                            });
                            $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                            $('.customInputSearchDiv').addClass('flex-row margin-20')
                        }
                    }
                })
            }
        })
    }
}


renderPopover=(value,row)=>{
    return `<div style="position:relative" id='${row.purchaseOrderID}' onclick="showPopover('${row.purchaseOrderID}','${row.stockReference}',this)" class ="customViewButton"> <img src="../../assets/img/ic-more-vertical-gray.png" /> </div>`
}

$('body').click(()=>{
    if(isOpen && isButtonClicked == false){
        $(".popoverDiv").remove();
        isOpen=false;
    }else if(isOpen && isButtonClicked == true){
        isButtonClicked = false;
    }
})

function showPopover(purchaseOrderID,stockReference,el){
    console.log(purchaseOrderID,'purchaseOrderID')
    const rect = el.getBoundingClientRect();

    var positionObj =  {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };

    isOpen= true;
    isButtonClicked = true;
    $(".popoverDiv").remove();

    if(positionObj.top > 800){
        $("#"+purchaseOrderID).append(`<div class='popoverDiv popoverPosition'>
        <a class="popoverSpan" href="acceptPendingDeliveries.html?poID=${purchaseOrderID}=${stockReference}"><img class="popoverIcon" src="../../assets/img/accept_icon.png" /> <small>Accept</small></a>
        <span class="popoverSpan"  onclick="getPurchaseOrder('${purchaseOrderID}','')"><img class="popoverIcon" src="../../assets/img/download_grey.png" /> <small>Download</small></span>
        <span class="popoverSpan"  onclick="getPurchaseOrder('${purchaseOrderID}','print')"><img class="popoverIcon" src="../../assets/img/print_grey.png" /> <small>Print</small></span>
        <a class="popoverSpan" href="pendingDeliveryDetail.html?poID=${purchaseOrderID}=${stockReference}"><img class="popoverIcon" src="../../assets/img/view_icon.png" /> <small>View</small></a></div>`);
    }
    else {
        $("#"+purchaseOrderID).append(`<div class="popoverDiv">
        <a class="popoverSpan" href="acceptPendingDeliveries.html?poID=${purchaseOrderID}=${stockReference}"><img class="popoverIcon" src="../../assets/img/accept_icon.png" /> <small>Accept</small></a>
        <span class="popoverSpan"  onclick="getPurchaseOrder('${purchaseOrderID}','')"><img class="popoverIcon" src="../../assets/img/download_grey.png" /> <small>Download</small></span>
        <span class="popoverSpan"  onclick="getPurchaseOrder('${purchaseOrderID}','print')"><img class="popoverIcon" src="../../assets/img/print_grey.png" /> <small>Print</small></span>
        <a class="popoverSpan" href="pendingDeliveryDetail.html?poID=${purchaseOrderID}=${stockReference}"><img class="popoverIcon" src="../../assets/img/view_icon.png" /> <small>View</small></a></div>`);
    }	  
}


getPurchaseOrder=async(poID,action)=>{
    purchaseOrderID= poID
    vendorDetail = await new Promise((resolve,reject)=>{
    
        db.get('SELECT *  FROM vendors',function(err, data) {
    
            if(err){
                console.log(err)
                 isError(fetchingErrMsg,reRenderLocation)
            }
            else{
                resolve(data);
            }
        })
    })
      
    var poData = await new Promise((resolve,reject)=>{
        db.get(`SELECT * FROM poSummary WHERE purchaseOrderID = '${purchaseOrderID}'`,function(err, poData) {
    
            if(err){
                console.log(err)
                 isError(fetchingErrMsg,reRenderLocation)
            }
            else{
                resolve(poData);
            }
        })
    })
 
        parsedPoData = JSON.parse(poData.json);
        parsedPoSummary = parsedPoData.purchaseOrderSummary
        parsedPoDetail = parsedPoData.purchaseOrderDetail  

    if(parsedPoDetail.length){
        parsedPoDetail.map((m,i)=>{
            m['SNo']= i+1;
            totalItems= i+1;
        })

        poSummaryData = parsedPoSummary[0]

        subTotal = poSummaryData.netBill
        totalTax = poSummaryData.taxes
        totalPrice =poSummaryData.grossBill
        unipaySchemeAdj =poSummaryData.unipaySchemeAdjustment
        creditNoteAdj =poSummaryData.creditNoteAdjustment
        debitNoteAdj = poSummaryData.debitNoteAdjustment

        dataTime =  (parsedPoDetail[0].orderTimeLocal).split(" ")
        triggerPrintPdf(parsedPoDetail,action)
    }

 }

triggerPrintPdf = (parsedPoDetail,action) => {
    var currentTimestamp = moment().format("YYYYMMDDHHmmss")
    var table1columns = [
        {title: "#", dataKey: "SNo"},
        {title: "Item Name", dataKey: "productName"}, 
        {title: "Quantity", dataKey: "quantityOrdered"},
        {title: "Price", dataKey: "productActualPrice"},
        {title: "Total Price", dataKey: "productValue"},
    ];
        
    var columnsObj ={
        table1columns,
    }

    var tableData = parsedPoDetail;
    var orderInfoDetail = poSummaryData

    var unipayInfo = {
        'unipaySchemeAdj' :orderInfoDetail.unipaySchemeAdjustment,
        'creditNoteAdj' :orderInfoDetail.creditNoteAdjustment,
        'debitNoteAdj' : orderInfoDetail.debitNoteAdjustment,
        'reversePayout' :  orderInfoDetail.reversedPayouts,
        'outletPayout' :  orderInfoDetail.outletPayoutAdjustment,
        'netPayable' :  orderInfoDetail.grossBill,
    }

    var billInfo={
        'orderNo':orderInfoDetail.stockReference,
        'billNo':orderInfoDetail.invoiceNumber,
        'billTime':orderInfoDetail.orderCreationTimeLocal,
    }

    var orderInfo={
        'totalPrice' : orderInfoDetail.grossBill,
        'totalItems' : tableData.length,
        'unipayInfo':unipayInfo,
    }

    var docInfo = {
        'action':action,
        'title' : 'Stock Summary',
        'storeInfoShown' :true,
        'billInfo':billInfo,
        'vendorInfo' :vendorDetail,
        'orderInfo' : orderInfo,
        'taxShown': false,
        'fileName' : `${purchaseOrderID}_${currentTimestamp}.pdf`
    }

    console.log(tableData)
    printPdf(columnsObj,tableData,docInfo) 

    // if(type){
    //     $('#successTag').text('Print')
    //     $('#successTagl').text('printed')
    //     $('.fileName').text(`EGIRdetails.pdf`)
    //     $('#successModal').modal('show');
    //     $('#fileLocation').css('display','none')
    // }
    // else if(status){
    //     $('#successTag').text('Download')
    //     $('#successTagl').text('downloaded')
    //     $('.fileName').text(`EGIRdetails.pdf`)
    //     $('#successModal').modal('show');
    // }
};

closeModal=()=>{
    $(`#successModal`).modal('hide');
}