var billNumber;
var returnedStockProductsData = [];
parsedReturnedStockData = []

var fetchingErrMsg='Error in Fetching order!'
var reRenderLocation='inventoryDashboard.html'

var stockReference; 
var totalPrice;
var totalItems;
var orderDate;
var vendorDetail;
var orderID;

$(async()=>{
    await getMenu('Returned Stock Detail')
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
        window.location.href= reRenderLocation
    })
}

function getPurchaseOrderDetail(ID) {
    db.all(`SELECT * FROM stockTransactionSummary WHERE ID = '${ID}'`,function(err, stockData) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{             
            if(stockData.length){
                var returnedStockData = stockData[0].json;
                parsedReturnedStockData = JSON.parse(returnedStockData);
                console.log(parsedReturnedStockData,'parsedReturnedStockData')
                returnedStockProductsData = parsedReturnedStockData.transactionProducts
                returnedStockProductsData = returnedStockProductsData.filter(m=>m.voidQuantity > 0)
                returnedStockProductsData.map((m,i)=>{
                    m['SNo']= i+1;

                    return m
                })
                console.log(returnedStockProductsData,'returnedStockProductsData')
                stockReference = parsedReturnedStockData['stockReference'];
                totalPrice = parsedReturnedStockData['returnedPrice'];
                totalItems = parsedReturnedStockData['returnedItems'];
                orderDate = parsedReturnedStockData['transactionTimeLocal'].split(" ");

                $('#totalPrice').text(totalPrice); 
                $('#totalItems').text(totalItems); 
                $('#stockReference').text(stockReference);                      
                $('#orderDate').text(orderDate[0]);
                $('#orderTime').text(orderDate[1]);
                $('#tableFooter').css('display','flex');
            }
                
            $('#returnedStockProductsList').bootstrapTable('destroy');
            $('#returnedStockProductsList').bootstrapTable({
                data: returnedStockProductsData, search: false, pagination: false, trimOnSearch: false, reinit: true
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
        {title: "Price", dataKey: "productActualPrice"},
        {title: "Returned Quantity", dataKey: "voidQuantity"},
        {title: "Returned Price", dataKey: "voidAmount"},
        {title: "Total Price", dataKey: "inventoryCost"},
        // {title: "Total", dataKey: "totalPrice"}, 
    ];
        
    var columnsObj ={
        table1columns,
    }

    var tableData = returnedStockProductsData;
    var orderInfoDetail = parsedReturnedStockData

    var billInfo={
        'orderNo':orderInfoDetail.stockReference,
        'billNo':orderInfoDetail.billNumber,
        'billTime':orderInfoDetail.transactionTimeLocal,
    }

    var orderInfo={
        'totalPrice' : orderInfoDetail.returnedPrice,
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

    printPdf(columnsObj,tableData,docInfo) 

    // if(type){
    //     $('#successTag').text('Print')
    //     $('#successTagl').text('printed')
    //     $('.fileName').text(`returnedStock.pdf`)
    //     $('#successModal').modal('show');
    //     $('#fileLocation').css('display','none')
    // }
    // else if(status){
    //     $('#successTag').text('Download')
    //     $('#successTagl').text('downloaded')
    //     $('.fileName').text(`returnedStock.pdf`)
    //     $('#successModal').modal('show');
    // }

};
closeModal=()=>{
    $(`#successModal`).modal('hide');
}