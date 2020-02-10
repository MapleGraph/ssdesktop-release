
var receivedStockProductsData = [];parsedReceivedStockData = []

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='inventoryDashboard.html'

var stockReference; 
var totalPrice;
var totalItems;
var orderDate;
var vendorDetail;
var orderID;
var ID;


$(async()=>{
    await getMenu('Received Stock Detail')
    await backNavigation()

    var str = window.location.search.split("=");
    ID =str[1];
    poID = str[2]
    $('#srHead').text(poID)
    orderID = poID
    getPurchaseOrderDetail(ID)
})

backNavigation=()=>{    
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}

function getPurchaseOrderDetail(ID) {
    db.all(`SELECT * FROM stockTransactionSummary WHERE ID = '${ID}'`,function(err, stockData) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{            
            console.log(stockData) 
            if(stockData.length){
                var receivedStockData = stockData[0].json;
                parsedReceivedStockData = JSON.parse(receivedStockData);
                console.log(parsedReceivedStockData,'parsedReceivedStockData')
        
                receivedStockProductsData = parsedReceivedStockData.transactionProducts
                receivedStockProductsData.map((m,i)=>{
                    m['SNo']= i+1;
                })
        
                console.log(receivedStockProductsData,'receivedStockProductsData')
                
                
                totalPrice = parsedReceivedStockData['totalCost'];
                totalItems = parsedReceivedStockData['totalItemNumber'];
                stockReference = parsedReceivedStockData['stockReference'];
                orderDate = parsedReceivedStockData['transactionTimeLocal'].split(" ");
                
                $('#tableFooter').css('display','flex');
                $('#totalPrice').text(totalPrice); 
                $('#totalItems').text(totalItems); 
                $('#stockReference').text(stockReference);                      
                $('#orderDate').text(orderDate[0]);
                $('#orderTime').text(orderDate[1]);
            }
    
            $('#receivedStockProductsList').bootstrapTable('destroy');
            $('#receivedStockProductsList').bootstrapTable({
                data: receivedStockProductsData, search: false, pagination: false, trimOnSearch: false, reinit: true
            });
        
            $(".card-body").addClass("padding-fix");
    
            db.get('SELECT *  FROM vendors',(err,data)=>{
                if(err){
                    console.log(err)
                    isError(fetchingErrMsg,reRenderLocation)
                }
                else{          
                    vendorDetail = data
                    $('#vendorName').text(vendorDetail.vendorName);
                    $('#vendorGUID').text(vendorDetail.vendorGUID);
                    $('#GSTNumber').text(vendorDetail.GSTNumber);
                    console.log(vendorDetail,'vendorDetail')
                }
            })
        }
    })
}

triggerPrintPdf = async(action) => {
    var currentTimestamp = moment().format("YYYYMMDDHHmmss")
    var table1columns = [
        {title: "#", dataKey: "SNo"},
        {title: "Item Name", dataKey: "productName"}, 
        {title: "Quantity", dataKey: "quantity"},
        {title: "Price", dataKey: "productActualPrice"},
        {title: "Total Price", dataKey: "inventoryCost"},
        // {title: "Total", dataKey: "totalPrice"}, 
    ];
        
    var columnsObj ={
        table1columns,
    }

    var tableData = receivedStockProductsData;
    var orderInfoDetail = parsedReceivedStockData

    var billInfo={
        'orderNo':orderInfoDetail.stockReference,
        'billNo':orderInfoDetail.billNumber,
        'billTime':orderInfoDetail.transactionTimeLocal,
    }

    var orderInfo={
        'totalPrice' : orderInfoDetail.totalCost,
        'totalItems' : tableData.length,
    }

    var docInfo = {
        'action':action,
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
    //     $('.fileName').text(`receivedStock.pdf`)
    //     $('#successModal').modal('show');
    //     $('#fileLocation').css('display','none')
    // }
    // else if(status){
    //     $('#successTag').text('Download')
    //     $('#successTagl').text('downloaded')
    //     $('.fileName').text(`receivedStock.pdf`)
    //     $('#successModal').modal('show');
    // }

};
closeModal=()=>{
    $(`#successModal`).modal('hide');
}