var stockReferenceID;
var requisitionDetail;
var productList = []

var parsedRequisitionDetail;
var refundsList = [];
var dataTime;
var vendorDetail;
var totalPrice;

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='inventoryDashboard.html'

$(async()=>{
    await getMenu('Placed Order')
    await backNavigation()
    
    var str = window.location.search.split("=");
    stockReferenceID =str[1];
    $('#srHead').text(stockReferenceID)
    getPlacedOrderDetail(stockReferenceID)
})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}

function getPlacedOrderDetail(stockReferenceID) {

    db.all(`SELECT json FROM stockRequisitionSummary WHERE stockReference = '${stockReferenceID}'`,function(err, row) {
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
                productList = parsedRequisitionDetail.requisitionProducts;
                console.log(productList,'productList')
    
                $('#totalItems').text(parsedRequisitionDetail.totalItemNumber);
                $('#totalPrice').text(parsedRequisitionDetail.totalCost);
                $('#stockReferenceID').text(stockReferenceID);
    
                dataTime =  (parsedRequisitionDetail.requisitionTimeLocal).split(" ")
                $('#orderDate').text(dataTime[0]);
                $('#orderTime').text(dataTime[1]);
            }
    
                productList.map((m,i)=>{
                    m['SNo']= i+1;
                    m['price']=parseFloat(m.price).toFixed(2)
                    m['totalPrice']= parseFloat(m.quantity * m.price).toFixed(2)
                })
            $('#datatable1').bootstrapTable('destroy');
            $('#datatable1').bootstrapTable({
                data: productList,
                search: false,
                pagination: false,
                trimOnSearch: false,reinit: true
            });
            if(productList.length){
                $('#tableFooter').css('display','flex');
                $(".card-body").addClass("padding-fix"); 
            }
    
            db.all('SELECT *  FROM vendors',(err,data)=>{if(err){
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
    })
}

triggerPrintPdf = (action) => {
    var currentTimestamp = moment().format("YYYYMMDDHHmmss")
    var table1columns = [
        {title: "#", dataKey: "SNo"},
        {title: "Item Name", dataKey: "productName"}, 
        {title: "Quantity", dataKey: "quantity"},
        {title: "MRP", dataKey: "mrp"},
        {title: "TUR", dataKey: "price"},
        {title: "Total Price", dataKey: "totalPrice"},
        // {title: "Total", dataKey: "totalPrice"}, 
    ];
        
    var columnsObj ={
        table1columns,
    }

    var tableData = productList;
    var orderInfoDetail = parsedRequisitionDetail

    var billInfo={
        'billNo':orderInfoDetail.stockReference,
        'billTime':orderInfoDetail.requisitionTimeLocal,
    }

    var orderInfo={
        'totalPrice' : orderInfoDetail.totalCost,
        'totalItems' : tableData.length,
    }

    var docInfo = {
        'action' : action,
        'title' : 'Bill Summary',
        'orderInfo':orderInfo,
        'billInfo':billInfo,
        'taxShown': false,
        'storeInfoShown' :true,
        'fileName' : `${stockReferenceID}_${currentTimestamp}.pdf`,
        'reRenderLocation':reRenderLocation
    }

    console.log(tableData)

    printPdf(columnsObj,tableData,docInfo) 
};


closeModal=()=>{
    $(`#successModal`).modal('hide');
}