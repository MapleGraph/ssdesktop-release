var store = JSON.parse(localStorage.getItem('loginResponse'));
var storeID = store.storeList[0].storeID;
var userID = store.userID;
var userName = JSON.parse(localStorage.getItem('phoneNumber'));

var totalItems = 0;
var totalOrderedItems = 0;
var totalReturnedPrice = 0;
var totalReturnedItems = 0;
var maxQuantity = 0;
var poData = [];
var poSummary =[];
var returnedItemsList=[];
var poID;
var invoiceNumber;
var stockReference;
var productIDs;
var batchVariantsIDs;
var parsedPoSummary = [] ;
var parsedPoDetail = [];
var totalProductsQuantity = 0;
var totalProductsAcceptedQuantity = 0;
var parsedPoBatchData;

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='inventoryDashboard.html'

$(document).on('keydown',function(e) {
    if(e.keyCode == 9) {
        e.preventDefault()
    }
});

$(async()=>{
    await getMenu('Accept Orders')
    await backNavigation()

    var str = window.location.search.split("=");
    console.log(str,'str')
    if(str.length){
        poID =str[1];
        stockReference =str[2];
        $('#poHead').text(stockReference)
        getPurchaseOrderID(poID)
    }
})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}

 function getPurchaseOrderID (purchaseOrderID) {

    db.all(`SELECT * FROM poSummary WHERE purchaseOrderID = '${purchaseOrderID}' AND status LIKE 'RECEIVED'`,async function(err, row) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(row.length){
                let poDetail = row[0].json;
                let batchDetail = row[0].batchJson;

                let parsedPoData = JSON.parse(poDetail);
                parsedPoBatchData = JSON.parse(batchDetail);
                console.log(parsedPoBatchData,'parsedPoBatchData')
                console.log(parsedPoData,'parsedPoData')
                
                parsedPoSummary = parsedPoData.purchaseOrderSummary
                parsedPoDetail = parsedPoData.purchaseOrderDetail
                invoiceNumber =  parsedPoSummary[0].invoiceNumber;
                stockReference =  parsedPoSummary[0].stockReference;
            }

            if(parsedPoDetail.length){
                productIDs = []
                batchVariantsIDs = []
                parsedPoDetail.map((m,i)=>{
                    productIDs.push(m.productID)
                    batchVariantsIDs.push(m.batchVariantID)
                    m['voidAmount'] = 0;
                    m.quantityFulfilled = m.quantityOrdered;
                    m['inventoryCost'] = m.productValue;
                    totalItems= i+1;
                    totalProductsQuantity += m.quantityFulfilled
                }) 
                console.log(parsedPoDetail,'parsedPoDetail')
                console.log(parsedPoSummary,'parsedPoSummary')

                var sbomProdData = await mapChildtoParent(parsedPoDetail,parsedPoBatchData)
                console.log(sbomProdData,'sbomProdData')

                poData = sbomProdData;
                productIDs = productIDs.toString()
                batchVariantsIDs = batchVariantsIDs.toString()
    
                await new Promise((resolve,reject)=>{

                    db.all(`SELECT productID,unitsPerCase FROM products WHERE productID IN (${productIDs})`,(err,data)=>{
                        if(err){
                            console.log(err)
                            isError(fetchingErrMsg,reRenderLocation)
                        }
                        else{
                            // if(data.length){
                            //     poData.map(m=>{
                            //         var upcData = data.find(n=>n.productID==m.productID)
                            //         m['upc'] = upcData.unitsPerCase
                            //         return m
                            //     })
                            // }

                            poData.sort(function(a,b){ 
                                return b.productActualPrice- a.productActualPrice;
                            });

                            poData.map((m,i)=>{
                                m['SNo'] = i+1
                            })

                            $('#datatable1').bootstrapTable('destroy');
                            $('#datatable1').bootstrapTable({
                                data: poData,
                                search: false,
                                pagination: false,
                                trimOnSearch: false,reinit: true
                            });

                            resolve();
                        }
                    })

                })
    
                $('#tableFooter').css('display','flex');
                $(".card-body").addClass("padding-fix");
                $('#totalItems').text(totalItems);
    
                $('#subtotal').text(parsedPoSummary[0].netBill);
                $('#totalTax').text(parsedPoSummary[0].taxes);
                $('#totalPrice').text(parsedPoSummary[0].grossBill);
            }
        }
    })
}

mapChildtoParent=async(prodData,batchData)=>{
    let sbomProdData = prodData

    for (let g = 0; g < sbomProdData.length; g++) {

        
        let p = await new Promise((resolve,reject) =>{

            db.get(`SELECT cpLinkage,parentSkuQty,childSkuQty,sbomDesc, strftime('%m', manufacturingDate) || substr(strftime('%m%Y', manufacturingDate),3, 2) AS pkd FROM storeRegion AS A INNER JOIN batchProductVariants AS B ON A.batchVariantID = B.batchVarRefID  WHERE B.batchVariantID = '${sbomProdData[g].batchVariantID}'`,(err,data)=>{
                if(err){
                    console.log(err)
                    return false
                }
                else{ 
                    console.log(g,data,sbomProdData[g])
                    if(data){
                        sbomProdData[g].sbomDesc = data.sbomDesc;
                        sbomProdData[g].pkd = data.pkd;
                        if (data.sbomDesc == 'LSBOM-P') {
                            var cpLinkage = data.cpLinkage
                            var parentSkuQty = data.parentSkuQty
                            var childSkuQty = data.childSkuQty
                            sbomProdData[g]['cpLinkage'] = cpLinkage;
                            sbomProdData[g]['parentSkuQty'] = parentSkuQty;
                            sbomProdData[g]['childSkuQty'] = childSkuQty;
                            sbomProdData[g]['isParent'] = 1;
        
                        }else if(data.sbomDesc == 'LSBOM-C'){
                            sbomProdData[g]['isChild'] = 1;
                        }
                        
                        
                    }else{
                        sbomProdData[g]['isChild'] = 1;
                    }

                    resolve();

                }
            })
    
            
        })

                
        
    }

    return sbomProdData;

    
}
renderItemName=(value,row)=>{
    if(row.isChild){
        return `<div class='flex-row childDiv'">${row.productName}</div>`
    }
    else{
        return `<div class='flex-row'">${row.productName}</div>`
    }
}

renderQuatityInput=(value,row)=>{
    if(row.isChild){
        return `<div class='flex-row inactive' style="justify-content:flex-end;">
        <button  class='btn btn-primary btn-xs quant-chng-btn'  id="deBtn${row.purchaseOrderSubID}" onclick="decreaseQuantity(${row.purchaseOrderSubID},this)"> - </button>
        <input value="${row.quantityOrdered}" min="0" onkeyup="changeQuantity(event,${row.purchaseOrderSubID})" onclick="changeQuantity(event,${row.purchaseOrderSubID})"  type='number' class='quantityInput' id="quant${row.purchaseOrderSubID}" name='quantityOrdered' />
        <button class='btn btn-primary btn-xs quant-chng-btn'  id="inBtn${row.purchaseOrderSubID}" disabled onclick="increaseQuantity(${row.purchaseOrderSubID},this) "> + </button>
        </div>`
    }
    else{
        return `<div class='flex-row' style="justify-content:flex-end">
        <button  class='btn btn-primary btn-xs quant-chng-btn'  id="deBtn${row.purchaseOrderSubID}" onclick="decreaseQuantity(${row.purchaseOrderSubID},this)"> - </button>
        <input value="${row.quantityOrdered}" min="0" onkeyup="changeQuantity(event,${row.purchaseOrderSubID})" onclick="changeQuantity(event,${row.purchaseOrderSubID})"  type='number' class='quantityInput' id="quant${row.purchaseOrderSubID}" name='quantityOrdered' />
        <button class='btn btn-primary btn-xs quant-chng-btn'  id="inBtn${row.purchaseOrderSubID}" disabled onclick="increaseQuantity(${row.purchaseOrderSubID},this) "> + </button>
        </div>`
    }
}

changeQuantity=async(event,rowID)=>{
    var obj = {}
    poData.map(m=>{
        if(m.purchaseOrderSubID ==rowID){
            maxQuantity = m.quantityOrdered;
            obj = m;
        }
    })

    currentValue =  parseInt(event.target.value);
    inputID = '#quant'+rowID;
    if(currentValue>maxQuantity){
        $('#quant'+rowID).val(maxQuantity);
        $('#inBtn'+rowID).attr("disabled", true);   
    }
    else if(currentValue<0){
        $('#quant'+rowID).val(maxQuantity);
        $('#inBtn'+rowID).attr("disabled", true);
    }
    else{
        obj['quantityFulfilled']=currentValue;
        obj['voidQuantity']=maxQuantity - currentValue;
        obj['voidAmount'] = parseFloat((obj.productValue * obj.voidQuantity / maxQuantity).toFixed(2));
        obj['inventoryCost'] = parseFloat((obj.productValue * obj.quantityFulfilled / maxQuantity).toFixed(2));
        
        $('#deBtn'+rowID).attr("disabled", false);
        $('#inBtn'+rowID).attr("disabled", false);
        if(currentValue==maxQuantity){
            $('#inBtn'+rowID).attr("disabled", true);;
        }
        if(obj.isParent){

            for (let s = 0; s < poData.length; s++) {
                let serialNumber = poData[s].serialNumber;
                if (serialNumber == obj.cpLinkage) {
                    let tempObj = poData[s];
                 await   handleChildProductReturn(poData,tempObj);
                    break;        
                }
                
            }
            
        }
        reRenderTable()
    }
    $('#quant'+rowID).blur(function(){
        if(!currentValue && currentValue!=0){
            $('#quant'+rowID).val(maxQuantity);
            $('#inBtn'+rowID).attr("disabled", true);
        }
    });
}


increaseQuantity=async(rowID)=>{
    var obj = {}
    poData.map(m=>{
        if(m.purchaseOrderSubID ==rowID){
            maxQuantity = m.quantityOrdered;
            obj = m;
        }
    })


    inputID = '#quant'+rowID;
    $('#deBtn'+rowID).attr("disabled", false);
    var currentValue = $(inputID).val();
    if(currentValue<maxQuantity){
        currentValue++;	
        obj['quantityFulfilled']=currentValue;
        obj['voidQuantity']=maxQuantity - currentValue;	
        obj['voidAmount'] = parseFloat((obj.productValue * obj.voidQuantity / maxQuantity).toFixed(2));
        obj['inventoryCost'] = parseFloat((obj.productValue * obj.quantityFulfilled / maxQuantity).toFixed(2));

        $(inputID).val(currentValue);
        if(currentValue==maxQuantity){
         $('#inBtn'+rowID).attr("disabled",true);
        }
        if(obj.isParent){
            for (let s = 0; s < poData.length; s++) {
                let serialNumber = poData[s].serialNumber;
                if (serialNumber == obj.cpLinkage) {
                    let tempObj = poData[s];
                    await handleChildProductReturn(poData,tempObj);
                    break;        
                }
                
            }

            
        }  
        await reRenderTable()
    }   
}

decreaseQuantity=async(rowID)=>{
    var obj ={}
    poData.map(m=>{
        if(m.purchaseOrderSubID ==rowID){
            maxQuantity = m.quantityOrdered;
            obj = m;
        }
    })
    inputID = '#quant'+rowID;
    $('#inBtn'+rowID).attr("disabled", false);
    var currentValue = $(inputID).val();

    if(currentValue>0){
        currentValue--;	
        obj['quantityFulfilled']=currentValue;
        obj['voidQuantity']=maxQuantity - currentValue;	
        obj['voidAmount'] = parseFloat((obj.productValue * obj.voidQuantity / maxQuantity).toFixed(2));
        obj['inventoryCost'] = parseFloat((obj.productValue * obj.quantityFulfilled / maxQuantity).toFixed(2));
        $(inputID).val(currentValue);
       if(currentValue<=0){
            $('#deBtn'+rowID).attr("disabled",true);
        }   
        if(obj.isParent){
            for (let s = 0; s < poData.length; s++) {
                let serialNumber = poData[s].serialNumber;
                if (serialNumber == obj.cpLinkage) {
                    let tempObj = poData[s];
                  await  handleChildProductReturn(poData,tempObj);
                    break;        
                }
                
            }

            
        }  
        reRenderTable()
    }
}

renderAmount=(value,row)=>{
        return `<div  class=" flex-row" id="amntDiv${row.productID}">${row.productValue}</div>`;
}

reRenderTable=()=>{
    console.log(poData,'poData')
    var totalNew = 0
    poData.map(m=>{
        var productActualPriceNew = m.productValue / m.quantityOrdered 
        var productValueNew = m.quantityFulfilled * productActualPriceNew
        productValueNew = parseFloat(productValueNew.toFixed(3))
        totalNew +=productValueNew
        $('#amntDiv'+m.productID).text(productValueNew)
    })
    totalNew = parseFloat(totalNew.toFixed(3))
    $('#totalPrice').text(totalNew)
}

closeReturn=()=>{
    $('#myModal').modal('hide');
}

handleChildProductReturn=async(poData,obj)=>{
    var sBomProdData = poData
    let childObj = obj;
    childObj.voidQuantity = 0;
    childObj.quantityFulfilled = childObj.quantityOrdered;
    console.log(poData,childObj)
    let p = await new Promise((resolve,reject) =>{
        sBomProdData.map(m=>{
    
            if(m.cpLinkage == childObj.serialNumber){
    
                if(m.voidQuantity>=m.parentSkuQty){
                    var i = Math.floor(m.voidQuantity/m.parentSkuQty);
                    // if (m.parentSkuQty == 1) {
                    //     i = 1;
                    // }

                    if(childObj.voidQuantity == undefined || childObj.voidQuantity == ""){
                        childObj.voidQuantity = parseInt(i*m.childSkuQty) ;
                        
        
                    }else{
                        if(m.voidQuantity%m.parentSkuQty == 0){
                            childObj.voidQuantity = parseInt(parseInt(childObj.voidQuantity) + parseInt(i*m.childSkuQty));
                        }
                        
        
                    }
                    childObj.quantityFulfilled =childObj.quantityOrdered - childObj.voidQuantity;
                    childObj.voidAmount = 0.00;
                    childObj.inventoryCost = 0.00;
                    resolve();
    
                }else{
                    
                }
    
            }
        })
    
    })
    
    let adjustQuant = childObj.voidQuantity;
    for (let g = 0; g < poData.length; g++) {
        const serialNumber = poData[g].serialNumber;
        if (childObj.serialNumber == serialNumber) {
            if (poData[g].quantityOrdered < adjustQuant) {
                poData[g].quantityFulfilled = 0;
                adjustQuant -= poData[g].quantityOrdered;
                poData[g].voidQuantity = poData[g].quantityOrdered -  poData[g].quantityFulfilled;
            }else{
                poData[g].quantityFulfilled = poData[g].quantityOrdered - adjustQuant;
                adjustQuant = 0;
                poData[g].voidQuantity = poData[g].quantityOrdered -  poData[g].quantityFulfilled;
            }
        }
        
    }
    console.log(poData,'finalPOData')
}


acceptOrder=()=>{
    totalReturnedPrice = 0;
    totalProductsAcceptedQuantity = 0;
    //for others LOGIC : get categoryID of product and check for catID in damage table and get applicable damageClaimType on basis of brandList also 
    db.all("SELECT * FROM damage WHERE categoryID LIKE 'ALL' AND brandList LIKE 'ALL' ",(err,damageClaim)=>{
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            returnedItemsList = poData.filter(m=> m.voidQuantity>0)
            orderAcceptedList =  poData.filter(m=> m.quantityFulfilled>0)
            poData.map(m=>{
                m['quantity'] = m.quantityFulfilled;
                m['costPrice'] = m.productActualPrice;
            })
            orderAcceptedList.map(m=> {
                totalProductsAcceptedQuantity += m.quantityFulfilled
            })
    
            console.log(returnedItemsList,orderAcceptedList,totalProductsAcceptedQuantity,totalProductsQuantity)
    
            totalReturnedItems = returnedItemsList.length;
            totalOrderedItems = orderAcceptedList.length;
            if(damageClaim.length){
                returnedItemsList.map(m=>{
                    console.log(m,'mm')
                    var options = damageClaim.map(n=> `<option value=${n.damageClaimTypeID}>${n.damageClaimTypeDescription}</option>`);
                    m.voidRemarks =  damageClaim[0].damageClaimTypeDescription
                    if(m.isChild){
                        m['reasonList'] = `<select class="select2 select2Form inactive" style="width:fit-content"  id="voidRemark${m.purchaseOrderSubID}" onchange="setRemark('${m.purchaseOrderSubID}')" disabled>${options}</select>`
                    }else{
                        m['reasonList'] = `<select class="select2 select2Form" style="width:fit-content"  id="voidRemark${m.purchaseOrderSubID}" onchange="setRemark('${m.purchaseOrderSubID}')">${options}</select>`   
                    }
                })
            }
    
            $('#returnedItemsListTable').bootstrapTable('destroy');
            $('#returnedItemsListTable').bootstrapTable({
                data:returnedItemsList,
                search:false,
                pagination:false,
                trimOnSearch:false,
                reinit: true,
            });
            $('.bootstrap-table .fixed-table-toolbar').css('background-color','#f1f4f7');
            $('#itemsList').children('.bootstrap-table').children('.fixed-table-toolbar').children('.customTableText').text('Item(s)');
            if(totalReturnedItems){
                $("#myModal").modal('show');
            }
            else{
                confirmReturn()
            }
            returnedItemsList.map(m=>{
                totalReturnedPrice +=parseFloat(m.voidAmount);
            })
            totalReturnedPrice = parseFloat(totalReturnedPrice.toFixed(2))
            $('#tableHeader1').css('display','flex');
            $('#totalItems1').text(totalReturnedItems);
            $('#totalPrice1').text(totalReturnedPrice.toFixed(2));
        }
    })
}

setRemark=(rowID)=>{
    var remark = $(`#voidRemark${rowID} option:selected`).html();
    poData.map(m=>{
        if(m.purchaseOrderSubID ==rowID){
           m.voidRemarks = remark
        }
    })                
}

confirmReturn=()=>{
    var today = new Date();
    year = today.getFullYear();
    month = (today.getMonth() + 1),
    day = today.getDate(),
    hour = today.getHours();
    minut = today.getMinutes();
    seconds= today.getSeconds()

    if (month.length < 2 || month<10) 
    month = '0' + month;
    if (day.length < 2 || day<10) 
    day = '0' + day;
    if (hour.length < 2 || hour<10) 
    hour = '0' + hour;
    if (minut.length < 2 || minut<10) 
    minut = '0' + minut;
    if (seconds.length < 2 || seconds<10) 
    seconds = '0' + seconds;

    var dateLocal = year+'-'+month+'-'+day;
    var timeLocal = dateLocal +" "+ hour + ":" + minut + ":" + seconds;
    //var timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
    var timezone="Asia/Kolkata";
    var fulfillmentStatus = totalProductsAcceptedQuantity==0 ? 'UNFULFILLED' : (totalProductsAcceptedQuantity < totalProductsQuantity ? 'PARTIALLY_FULFILLED' : 'FULFILLED')
    db.all('SELECT *  FROM vendors',(err,data)=>{
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(data.length){
                var vendorID = data[0].vendorID
                var pendingDeliveriesData = {
                    transactionID:null,
                    isSync:0,
                    isError:'',
                    errorMessage:'',
                    sourceID:storeID,
                    sourceType:'STORE',
                    destinationID:storeID,
                    destinationType:'STORE',
                    billNumber:invoiceNumber,
                    invoiceNumber:invoiceNumber,
                    orderID:poID,
                    purchaseOrderID:poID,
                    stockReference:stockReference,
                    transactionProducts:poData,
                    transactionIDForChild:'',
                    transactionIDForParent : '',
                    status:'APPROVED',
                    transactionType :'STOCK_IN',
                    userID:userID,
                    user:userID,
                    userName:userName,
                    vendorID:vendorID,
                    totalCost: (parsedPoSummary[0].grossBill - totalReturnedPrice).toFixed(2),
                    returnedItems:totalReturnedItems,
                    returnedPrice:totalReturnedPrice,
                    totalItemNumber:totalOrderedItems,
                    transactionTimeLocal:timeLocal,
                    transactionDate:dateLocal,
                    timezone:timezone,
                    remarks:'',
                    fulfillmentStatus:fulfillmentStatus
                }
                db.all(`SELECT status FROM poSummary WHERE purchaseOrderID = '${poID}'`,function(err, status) {
                    if(err){
                        console.log(err)
                        isError(fetchingErrMsg,reRenderLocation)
                    }
                    else{
                        if(status.length && status[0].status == 'COMPLETED'){
                            var placingErrMsg2='You have already placed this order!'
                            isError(placingErrMsg2,reRenderLocation)
                            return false
                        }
                        else{
                            db.run("INSERT INTO stockTransactionSummary VALUES ($ID, $transactionID, $isSync,$isError,$errorMessage, $sourceID, $sourceType,$destinationID, $destinationType,$billNumber,$transactionIDForChild,$transactionIDForParent,$status,$fulfillmentStatus,$transactionType, $userID,$userName,$totalCost,$totalItemNumber, $transactionTimeLocal,$transactionDate,$timezone ,$remarks, $isDraftMode,$json)",{
                                $ID:null,
                                $transactionID:null,
                                $isSync:0,
                                $isError:'',
                                $errorMessage:'',
                                $sourceID:storeID,
                                $sourceType:'STORE',
                                $destinationID:storeID,
                                $destinationType:'STORE',
                                $billNumber:invoiceNumber,
                                $transactionIDForChild:'',
                                $transactionIDForParent : '',
                                $status:'APPROVED',
                                $fulfillmentStatus : fulfillmentStatus,
                                $transactionType :'STOCK_IN',
                                $userID:userID,
                                $userName:userName,
                                $totalCost: (parsedPoSummary[0].grossBill - totalReturnedPrice).toFixed(2),
                                $totalItemNumber:totalOrderedItems,
                                $transactionTimeLocal:timeLocal,
                                $transactionDate:dateLocal,
                                $timezone:timezone,
                                $remarks:'',
                                $isDraftMode : 0,
                                $json: JSON.stringify(pendingDeliveriesData),
                            },(err,data)=>{
                                if(err){
                                    console.log(err);
                                    var placingErrMsg='Error in Placing order!'
                                    isError(placingErrMsg,reRenderLocation)
                                }else{
                                    console.log(poID,'poID')
                                    db.run(`UPDATE poSummary SET status = 'COMPLETED',fulfillmentStatus = '${fulfillmentStatus}' WHERE purchaseOrderID  = '${poID}'`,function(err){
                                        if(err){
                                            console.log(err);
                                        }
                                    })
                                    db.run(`UPDATE stockRequisitionSummary SET status = 'RECEIVED' WHERE stockReference  = '${stockReference}'`,function(err){
                                        if(err){
                                            console.log(err);
                                        }
                                    })
                                    poData.map(m=>{
                                        db.run(`UPDATE batchProductVariants SET inventory = inventory + ${parseFloat(m.quantityFulfilled)}, inventoryCost = inventoryCost +${parseFloat (m.inventoryCost)}  WHERE batchVariantID  = '${m.batchVariantID}'`,function(err){
                                            if(err){
                                                    console.log(err);
                                            }
                                        })
                                        db.all(`SELECT inventoryAmount,inventoryValue FROM products WHERE productID  = '${m.productID}'`,(err,data)=>{
                                            console.log(data[0].inventoryValue ,'dataPO')
                                            if(err){
                                                console.log(err)
                                                isError(fetchingErrMsg,reRenderLocation)
                                            }
                                            else{
                                                if(data.length){
                                                    db.run(`UPDATE products SET inventoryAmount = inventoryAmount + ${parseFloat(m.inventoryCost)}, inventoryValue = ${data[0].inventoryValue + parseFloat(m.quantityFulfilled)}  WHERE productID  = '${m.productID}'`,function(err){
                                                        if(err){
                                                            console.log(err);
                                                        }
                                                    })
                                                }                        
                                            }
                                        })
                                    })
                                    
                                    $('#orderID').text(poID);
                                    $('#amount').text(parsedPoSummary[0].grossBill);
                                    $('#tax').text(parsedPoSummary[0].taxes);
                                    $('#items').text(totalOrderedItems);
                                    $('#debitAdjustment').text(parsedPoSummary[0].debitNoteAdjustment);
                                    $('#creditAdjustment').text(parsedPoSummary[0].creditNoteAdjustment);
                                    $('#unipayAdjustment').text(parsedPoSummary[0].unipaySchemeAdjustment);
                                    $('#reversePayout').text(parsedPoSummary[0].reversedPayouts);
                                    $('#outletPayout').text(parsedPoSummary[0].outletPayoutAdjustment);
                                    $('#netPayble').text((parsedPoSummary[0].grossBill - totalReturnedPrice).toFixed(2));
                                    $('#refundAmount').text(totalReturnedPrice);
                            
                                    $("#myModal2").modal('show');
                                    $('#myModal').modal('hide');
                                }
                            })
                        }
                    }
                })  
            }
        }
    })
}

closeModal=()=>{
    $('#myModal2').modal('hide');
    window.location.href = reRenderLocation;
} 

$("#myModal2").on("hidden.bs.modal", function () {
    window.location.href= reRenderLocation
});

triggerDownloadPdf =()=> {
    var fontSize = 16;
    var textObj = [
        {
            'title' : 'Stock Received Details ',
            'value':'',
            'xPos': 15,
            'yPos' : 15,
            'align':'left',
            'textColor' : '#1766a6',
        },
    ]

    var modalData = {
        'id':'stockReceived',
        'xPos':15,
        'yPos':20,
        'width':170,
    }
    var fileName = "stockReceivedDetails.pdf"
    var downloadType = 'modal'
    downloadPdf(downloadType,modalData,textObj,fontSize,fileName)
};