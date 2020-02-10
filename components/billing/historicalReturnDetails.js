var orderID;
var parsedOrderInfoDetail;
var refundsList = [];
var dataTime;
var customerData;
var totalPrice;
var taxList=[];
var cash = 0;
var sum = 0;
var creditNotesDetails = []

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='billingDashboard.html'

$(async()=>{
    await getMenu('Historical Returns')
    await backNavigation()

    var str = window.location.search.split("=");
    ID =str[1];
    $('#returnOrderHead').text(ID)
    getReturnedOrderDetail(ID)
})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href="billingDashboard.html"
    })
}

function getReturnedOrderDetail(ID) {
    console.log(ID,'ID')

    db.all(`SELECT orderInformation FROM VoidOrderInformation WHERE ID = '${ID}'`,function(err, row) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(row.length){
                console.log(row,'row')
                orderInfo = row[0].orderInformation;
                parsedOrderInfoDetail = JSON.parse(orderInfo);
                if(parsedOrderInfoDetail.orderJSON){
                    parsedOrderInfoDetail = parsedOrderInfoDetail.orderJSON;
                }

                orderID = parsedOrderInfoDetail.orderID;
                console.log('parsedOrderInfoDetail',parsedOrderInfoDetail)

                if(parsedOrderInfoDetail.Status == "ORST_PARTIAL_CANCELLED"){
                    $('#toNewReturn').css('display','flex')
                }
                
                refundsList = parsedOrderInfoDetail.refundsList;
                
                var voidItemsSales = 0;
                var voidTax = 0;

                for(let i=0;i<refundsList.length;i++)
                {
                    voidItemsSales += refundsList[i].voidItemsSales;
                    voidTax += refundsList[i].voidTax;
                }

               
                voidItemsSales = Math.round(voidItemsSales * 1000)/1000;
                voidTax = Math.round(voidTax * 1000)/1000;

                var paymentDetails = parsedOrderInfoDetail.refundPayments;

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

    
                $('#totalItems').text(refundsList.length);
                $('#subtotal').text(voidItemsSales);
                $('#totalTax').text(voidTax);
                $('#totalPrice').text(parsedOrderInfoDetail.voidAmount);
                $('#refundDiscount').text(parsedOrderInfoDetail.refundDiscount);

                $('#returnID').text(parsedOrderInfoDetail.refundOrderID);
                dataTime =  (parsedOrderInfoDetail.voidTimeLocal).split(" ")
                $('#orderDate').text(dataTime[0]);
                $('#orderTime').text(dataTime[1]);
            }
    
                refundsList.map((m,i)=>{
                    m['SNo']= i+1;
                    m['price']=parseFloat(m.productBasePrice).toFixed(2)
                    // m['totalPrice']= parseFloat(m.voidQuantity * m.productBasePrice).toFixed(2)
                })
                // console.log(refundsList,'refundsList')

                rows = refundsList;
            $('#datatable1').bootstrapTable('destroy');
            $('#datatable1').bootstrapTable({
                data: refundsList,
                search: false,
                pagination: false,
                trimOnSearch: false,reinit: true
            });
            if(refundsList.length){
                $('#tableFooter').css('display','flex');
                $(".card-body").addClass("padding-fix"); 
            }

            customerData = parsedOrderInfoDetail.customers[0];

            $('#storeName').text(customerData.firstName);
            $('#storeGSTIN').text(customerData.gstNumber);
            $('#childCode').text(customerData.childCode);

            db.all(`SELECT * FROM unipayLedger WHERE orderID = '${orderID}'`,function(err,unipayData) {
                console.log(orderID,'orderID')
                if(err){
                    isError(fetchingErrMsg)
                }
                else{
                    if(unipayData.length){
                        readjstPoints = 0
                        earnedPoints = 0
                        unipayData.map(m=>{
                            if(m.transactionType=='EARNED'){
                                earnedPoints = m.amount
                            }
                            else if(m.transactionType=='READJUSTED'){
                                readjstPoints += m.amount
                            }
                        })
                        $('#unipayEarned').text(earnedPoints);
                        $('#unipayReadjst').text(readjstPoints);

                    }
                }

            })
        }

    })

}

toNewReturn=()=>{
    window.location.href = `newReturn.html?oID=${orderID}&historicalReturn`;
}


triggerPrintPdf = async(action) => {
    var currentTimestamp = moment().format("YYYYMMDDHHmmss")
    var table1columns = [
        {title: "S.No.", dataKey: "SNo"},
        {title: "Item Name", dataKey: "productName"}, 
        {title: "Quantity", dataKey: "voidQuantity"},
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

    var tableData = refundsList

    var orderInfoDetail = parsedOrderInfoDetail

    var billInfo={
        'billNo':orderInfoDetail.orderID,
        'billTime':orderInfoDetail.refundSettledTime,
    }

    var orderInfo={
        'totalPrice' : totalPrice,
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
        'action':action, 
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

function taxDetails()
{
 
    console.log('parsedOrderInfoDetail ',parsedOrderInfoDetail)

    var refundsList = JSON.parse(JSON.stringify(parsedOrderInfoDetail.refundsList));
    var taxList = [];

    for(let i=0;i<refundsList.length;i++)
    {
        var taxes = refundsList[i].taxes;
        
        for(let j=0;j<taxes.length;j++)
        {
            var found = false;

            for(let k=0;k<taxList.length;k++)
            {
                if(taxes[j].taxID == taxList[k].taxID)
                {
                    found = true;
                    taxList[k].taxValue += taxes[j].taxValue;
                    break;
                }
            }

            if(!found)
            {
                taxList.push({
                    taxID: taxes[j].taxID,
                    taxName: taxes[j].taxName,
                    taxValue: taxes[j].taxValue
                })
            }

        }
    }

    console.log(taxList)
    
    $('#taxList').empty();    

    for(let i=0;i<taxList.length;i++)
    {

        taxList[i].taxValue = Math.round(taxList[i].taxValue * 100)/100;
        
        $('#taxList').append(`
            <div class="flex-row" style="justify-content:space-between">
                <span class="text_16_500_212b36">${taxList[i].taxName}</span>
                <span class="text_16_500_212b36">&#8377; ${taxList[i].taxValue}</span>
            </div>
        `)
    }

    $('#taxModal').modal('show');

}