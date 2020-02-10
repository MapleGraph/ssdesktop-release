var orderID;
var parsedOrderInfoDetail;
var productsList = [];
var dataTime;
var customerData;

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='billingDashboard.html'
var cash = 0;
var sum = 0;
var creditNotesDetails = []


$(async()=>{
    await getMenu('Billing History')
    await backNavigation()

    var str = window.location.search.split("=");
    orderID =str[1];
    // $('#billingOrderHead').text(orderID)
    getReturnedOrderDetail(orderID)
})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href="billingDashboard.html"
    })
}

function getReturnedOrderDetail(orderID) {

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
                if(parsedOrderInfoDetail.Status != "ORST_CANCELLED"){
                    $('#toNewReturn').css('display','flex')
                }
                console.log(parsedOrderInfoDetail,'parsedOrderInfoDetail')
                productsList = parsedOrderInfoDetail.productsList;
    
                var paymentDetails = parsedOrderInfoDetail.paymentList

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

                $('#totalItems').text(productsList.length);
                $('#discount').text(0);
                if(parsedOrderInfoDetail.discountValue){
                    $('#discount').text((parsedOrderInfoDetail.discountValue).toFixed(3));
                }

                var subtotal = parseFloat(parsedOrderInfoDetail.discountValue)+parseFloat(parsedOrderInfoDetail.netBill)
                $('#subtotal').text(subtotal.toFixed(3));
                $('#totalTax').text((parsedOrderInfoDetail.taxes).toFixed(3));
                $('#totalPrice').text(parsedOrderInfoDetail.grossBill);

                $('#orderID').text(orderID);
                dataTime =  (parsedOrderInfoDetail.billSettledTimeLocal).split(" ")
                $('#orderDate').text(dataTime[0]);
                $('#orderTime').text(dataTime[1]);
            }
    
            productsList.map((m,i)=>{
                m['SNo']= i+1;
                m['price']=parseFloat(m.productBasePrice).toFixed(2)
                m['productPrice']= parseFloat((m.itemSales).toFixed(2))
            })

            console.log(productsList,'productsList')
            rows = productsList;
            $('#datatable1').bootstrapTable('destroy');
            $('#datatable1').bootstrapTable({
                data: productsList,
                search: false,
                pagination: false,
                trimOnSearch: false,reinit: true
            });
            if(productsList.length){
                $('#tableFooter').css('display','flex');
                $(".card-body").addClass("padding-fix"); 
            }

            customerData = parsedOrderInfoDetail.customers[0];

            $('#storeName').text(customerData.firstName);
            $('#storeGSTIN').text(customerData.gstNumber);
            // $('#childCode').text(customerData.childCode);
        }
    })
}

toNewReturn=()=>{
    window.location.href = `newReturn.html?oID=${orderID}`;
}

triggerPrintPdf = async(action) => {
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
    var orderInfoDetail = parsedOrderInfoDetail

    var billInfo={
        'billNo':orderInfoDetail.orderID,
        'billTime':orderInfoDetail.billSettledTimeLocal,
    }

    var creditNotesInfo={
        'creditNotesAdjust':sum,
        'payableAmnt':cash,
        'creditNotesDetails' : creditNotesDetails
    }

    var orderInfo={
        'totalPrice' : orderInfoDetail.grossBill,
        'discountValue': orderInfoDetail.discountValue,
        'rounding' : orderInfoDetail.rounding,
        'totalItems' : tableData.length,
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
    //     $('#fileLocation').css('display','none')
    //    // $('#successModal').modal('show');
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

    var productsList = JSON.parse(JSON.stringify(parsedOrderInfoDetail.productsList));
    var taxList = [];

    for(let i=0;i<productsList.length;i++)
    {
        var taxes = productsList[i].taxes;
        
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