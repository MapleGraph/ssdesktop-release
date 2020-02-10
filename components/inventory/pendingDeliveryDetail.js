var poID;
var parsedPoDetail =[]
var poSummaryData=[]

var totalPrice;
var totalItems;
var dataTime;
var vendorDetail;
var subTotal; 
var totalTax ;
var unipaySchemeAdj;
var creditNoteAdj;
var debitNoteAdj ;
var stockReference;
var orderID;
var netPayable=0;

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='inventoryDashboard.html'

$(async()=>{
    await getMenu('Pending Delivery Detail')
    await backNavigation()
    
    var str = window.location.search.split("=");
    if(str.length){
        poID =str[1];
        stockReference =str[2];
        $('#poHead').text(stockReference)
        orderID = poID
        getPurchaseOrderDetail(poID)
        $("#acceptPO").attr("href",`acceptPendingDeliveries.html?poID=${poID}=${stockReference}`)
    }
})
backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}

function getPurchaseOrderDetail(purchaseOrderID) {
    db.all(`SELECT * FROM poSummary WHERE purchaseOrderID = '${purchaseOrderID}'`,function(err, poData) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{ 
            if(poData.length){            
                poDetail = poData[0].json;
                parsedPoJsonData = JSON.parse(poDetail);

                parsedPoSummary = parsedPoJsonData.purchaseOrderSummary
                parsedPoDetail = parsedPoJsonData.purchaseOrderDetail
            }   
            if(parsedPoDetail.length){
                parsedPoDetail.map((m,i)=>{
                    m['SNo']= i+1;
                    totalItems= i+1;
                })
                $('#datatable1').bootstrapTable('destroy');
                $('#datatable1').bootstrapTable({
                    data: parsedPoDetail,
                    search: false,
                    pagination: false,
                    trimOnSearch: false,reinit: true
                });

                $('#tableFooter').css('display','flex');
                $('.discounted').css('color','#ba1800')
                $(".card-body").addClass("padding-fix");
                $('#totalItems').text(totalItems);

                poSummaryData = parsedPoSummary[0]

                console.log(parsedPoDetail,'parsedPoDetail')
                console.log(poSummaryData,'poSummaryData')

                subTotal = poSummaryData.netBill
                totalTax = poSummaryData.taxes
                totalPrice =poSummaryData.grossBill
                unipaySchemeAdj =poSummaryData.unipaySchemeAdjustment
                creditNoteAdj =poSummaryData.creditNoteAdjustment
                debitNoteAdj = poSummaryData.debitNoteAdjustment
                outletPayouts = poSummaryData.outletPayoutAdjustment
                reversedPayouts = poSummaryData.reversedPayouts
                netPayable = parseFloat(totalPrice)-parseFloat(unipaySchemeAdj)-parseFloat(creditNoteAdj)-parseFloat(outletPayouts)-parseFloat(reversedPayouts)+parseFloat(debitNoteAdj)
                netPayable = Math.round(netPayable);
                $('#subtotal').text(subTotal);
                $('#totalTax').text(totalTax);
                $('#totalPrice').text(totalPrice);
                $('#netPayable').text(netPayable.toFixed(3));

                $('#unipaySchemeAdj').text(unipaySchemeAdj);
                $('#creditNoteAdj').text(creditNoteAdj);
                $('#debitNoteAdj').text(debitNoteAdj);
                $('#outletPayOut').text(outletPayouts);
                $('#revPayOut').text(reversedPayouts);

                $('#purchaseOrderID').text(purchaseOrderID);
                
                dataTime =  (parsedPoDetail[0].orderTimeLocal).split(" ")
                $('#orderDate').text(dataTime[0]);
                $('#orderTime').text(dataTime[1]);
            

                db.all('SELECT *  FROM vendors',(err,data)=>{
                    if(err){
                        console.log(err)
                        isError(fetchingErrMsg,reRenderLocation)
                    }
                    else{ 
                        if(data.length){
                            vendorDetail = data[0]
                            $('#vendorName').text(vendorDetail.vendorName);
                            $('#vendorGUID').text(vendorDetail.vendorGUID);
                            $('#GSTNumber').text(vendorDetail.GSTNumber);
                        }
                    }
                })
            }
        }
    })
}

triggerPrintPdf =async (action) => {
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
        'netPayable' :  netPayable,
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
        'action' : action,
        'title' : 'Stock Summary',
        'storeInfoShown' :true,
        'billInfo':billInfo,
        'vendorInfo' :vendorDetail,
        'orderInfo' : orderInfo,
        'taxShown': false,
        'fileName' : `${orderID}_${currentTimestamp}.pdf`
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