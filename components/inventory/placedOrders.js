var table = 0;
var isOpen =false;
var isButtonClicked = false;
var  currDate;
var productList=[]
var dataTime;
var vendorDetail;
var totalPrice;
var stockReferenceID

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='inventoryDashboard.html'

$(async()=>{  
    await getMenu('Placed Order')
    await backNavigation()

    // currDate = currDate.split("-")
    // currDate = currDate[1]+'/'+currDate[2]+'/'+currDate[0]
    currDate = new Date().toDateInputValue()
    getPlacedOrders('all')
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

function getPlacedOrders(type){
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
            db.all(`SELECT A.stockReference,A.totalItemNumber,A.totalCost,A.totalItemNumber,A.status,A.requisitionTimeLocal,B.vendorGUID FROM stockRequisitionSummary AS A INNER JOIN vendors AS B ON A.vendorID = B.vendorID WHERE A.isDraftMode = 0 ORDER BY A.requisitionTimeLocal DESC`,function(err, data) {
                if(err){
                    console.log(err)
                    isError(fetchingErrMsg,reRenderLocation)
                }
                else{ 
                    console.log(data,'allData')
                    var placedOrdersList =data;
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
            db.all(`SELECT A.stockReference,A.totalItemNumber,A.totalCost,A.totalItemNumber,A.status,A.requisitionTimeLocal,B.vendorGUID FROM stockRequisitionSummary AS A INNER JOIN vendors AS B ON A.vendorID = B.vendorID WHERE A.isDraftMode = 0 AND DATE(A.requisitionTimeLocal) BETWEEN '${fromValue}' AND '${toValue}' ORDER BY A.requisitionTimeLocal DESC`,function(err, data) {
                if(err){
                    console.log(err)
                    isError(fetchingErrMsg,reRenderLocation)
                }
                else{ 
                    console.log(data,'selectedData')
                    var placedOrdersList =data;
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
    return `<div style="position:relative"  id='${row.stockReference}' onclick="showPopover('${row.stockReference}',this)" class ="customViewButton"> <img src="../../assets/img/ic-more-vertical-gray.png" /> </div>`
}

$('body').click(()=>{
    if(isOpen && isButtonClicked == false){
        $(".popoverDiv").remove();
        isOpen=false;
    }else if(isOpen && isButtonClicked == true){
        isButtonClicked = false;
    }
})

function showPopover(stockReference,el){
    const rect = el.getBoundingClientRect();

    var positionObj =  {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };

    isOpen= true;
    isButtonClicked = true;
    $(".popoverDiv").remove();

    if(positionObj.top > 800){
        $("#"+stockReference).append(`<div class='popoverDiv popoverPosition'>
        <span class="popoverSpan"  onclick="getPOList('${stockReference}')"><img class="popoverIcon" src="../../assets/img/download_icon.png" /> <small>Download</small></span>
        <a class="popoverSpan" href="placedOrderDetail.html?srID=${stockReference}"><img class="popoverIcon" src="../../assets/img/view_icon.png" /> <small>View</small></a></div>`);
    }
    else {
        $("#"+stockReference).append(`<div class="popoverDiv">
        <span class="popoverSpan"  onclick="getPOList('${stockReference}')"><img class="popoverIcon" src="../../assets/img/download_icon.png" /> <small>Download</small></span>
        <a class="popoverSpan" href="placedOrderDetail.html?srID=${stockReference}"><img class="popoverIcon" src="../../assets/img/view_icon.png" /> <small>View</small></a></div>`);
    }	  
}

getPOList=async(srID)=>{
    stockReferenceID= srID      
    var requisitionDetailData = await new Promise((resolve,reject)=>{
    
        db.get(`SELECT json FROM stockRequisitionSummary WHERE stockReference = '${srID}'`,function(err, data) {
    
            if(err){
                console.log(err)
               isError(fetchingErrMsg,reRenderLocation)
            }
            else{
                resolve(data);
            }
        })
    })

    requisitionDetail = requisitionDetailData.json;
    parsedRequisitionDetail = JSON.parse(requisitionDetail);
    productList = parsedRequisitionDetail.requisitionProducts;

    dataTime =  (parsedRequisitionDetail.requisitionTimeLocal).split(" ")

    productList.map((m,i)=>{
        m['SNo']= i+1;
        m['price']=parseFloat(m.price).toFixed(2)
        m['totalPrice']= parseFloat(m.quantity * m.price).toFixed(2)
    })
    triggerPrintPdf(productList)
 }

triggerPrintPdf = (productList) => {
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
        'title' : 'Bill Summary',
        'orderInfo':orderInfo,
        'billInfo':billInfo,
        'taxShown': false,
        'storeInfoShown' :true,
        'fileName' : `${stockReferenceID}_${currentTimestamp}.pdf`,
    }

    console.log(tableData)

    printPdf(columnsObj,tableData,docInfo) 
};


closeModal=()=>{
    $(`#successModal`).modal('hide');
}