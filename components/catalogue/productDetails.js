    
var productName,schemes;

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation='../dashboard.html'

var discountProductMap;

$(document).ready(async()=>{
    await getMenu('Product Details')
    await backNavigation()
 
    $('.select2').select2();

    db.all('SELECT DISTINCT incomeHead from products',function(error,rows){
        
        if(error){
            console.log(error)
        }
        else{
            console.log(rows)

            var incomeHead = rows;
            for(let i=0;i<incomeHead.length;i++)
            {
                incomeHeadValue = incomeHead[i].incomeHead;
                incomeHeadName = incomeHead[i].incomeHead;
                element = '<option value='+incomeHeadValue+'>'+incomeHeadName+'</option>'
                $('#incomeHead').append(element);
            }
        }
    })

    discountProductMap = await new Promise((resolve,reject)=>{

        db.all(`SELECT * FROM discountProductMap`,function(err,data){
            
            if(err){
                console.log(err)
            }
            else{
                console.log(data)
                resolve(data);
            }
        })
    })

})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href=reRenderLocation
    })
}

function goBack(){
    window.location.href = '../dashboard.html';
}

function rowStyle(row,index){
    return {classes:'rowStyle'}
}

function tableRowStyle(row,index){
    return {classes:'tableRowStyle'}
}

function viewSKU(value,row){

    return '<div onclick="handleSKU(this)" style="cursor:pointer;color:#1766a6;" id='+row.productID+'>'+'View SKU'+'</div>';
}

async function handleSKU(element){
    
    var productID = element.id;
    console.log(productID)

    // var closingStock = $('#closingStock').is(':checked');
    // console.log(closingStock);

    var closingStock = $('#switchOption1').val();

    if(closingStock == '1'){
     
        var SKU = await new Promise((resolve,reject)=>{

            db.all(`SELECT batchProductVariants.productName, batchProductVariants.productID, batchProductVariants.serialNumber, strftime('%m', batchProductVariants.manufacturingDate) || substr(strftime('%m-%Y', batchProductVariants.manufacturingDate),3, 3) AS pkm, batchProductVariants.inventory, batchProductVariants.inventoryCost, storeRegion.turPerUnit,storeRegion.mrpPerUnit from batchProductVariants INNER JOIN storeRegion ON batchProductVariants.serialNumber = storeRegion.sku WHERE batchProductVariants.productID = ${productID} AND batchProductVariants.inventory>0 ORDER BY batchProductVariants.inventory DESC`,function(error,rows){
                if(error){
                    console.log(error);
                }
                else{
                    resolve(rows)
                }
            })
        })
    }
    else{

        var SKU = await new Promise((resolve,reject)=>{

            db.all(`SELECT batchProductVariants.productName, batchProductVariants.productID, batchProductVariants.serialNumber, strftime('%m', batchProductVariants.manufacturingDate) || substr(strftime('%m-%Y', batchProductVariants.manufacturingDate),3, 3) AS pkm, batchProductVariants.inventory, batchProductVariants.inventoryCost, storeRegion.turPerUnit,storeRegion.mrpPerUnit from batchProductVariants INNER JOIN storeRegion ON batchProductVariants.serialNumber = storeRegion.sku WHERE batchProductVariants.productID = ${productID} ORDER BY batchProductVariants.inventory DESC`,function(error,rows){
                if(error){
                    console.log(error);
                }
                else{
                    resolve(rows)
                }
            })
        })
    }
    
    productName = SKU[0].productName;
    console.log('SKU ',SKU)
    console.log('productName ',productName)

    $('#productName').text(productName);
    $('#skuTable').bootstrapTable('destroy');
    $('#skuTable').bootstrapTable(
        {
            data:SKU,
            search:true,
            reinit: true,
            trimOnSearch:false,
            pagination:true
        }
    );

    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"});
    $('.customInputSearchDiv').addClass('flex-row margin-20')

    $('#skuModal').modal('show');
}

function viewSchemes(value,row){

    return '<div onclick="handleSchemes(this)" style="cursor:pointer;color:#1766a6;" id='+row.productID+'>'+'View Schemes'+'</div>';
}

async function handleSchemes(element){

    var productID = element.id;
    var found = false;
    var discountID,discount = [];
    schemes = [];

    console.log(productID)

    for(let i=0;i<discountProductMap.length;i++)
    {
        var discountProductList = discountProductMap[i].discountProductList;
        discountID = discountProductMap[i].discountID;

        discountProductList = discountProductList.split(',');

        console.log(discountProductList)

        for(let j=0;j<discountProductList.length;j++)
        {
            if(productID == discountProductList[j])
            {
                found = true;
                break;
            }
        }

        if(found){
            console.log(discountID);
            discount.push({discountID});
            break;
        }
    }

    if(!found){
        
        for(let i=0;i<discountProductMap.length;i++)
        {
            if(discountProductMap[i].discountProductList == 'ALL'){
                discount.push({discountID:discountProductMap[i].discountID})
            }
        }
    }

    console.log(discount)

    for(let i=0;i<discount.length;i++)
    {
        x = await new Promise((resolve,reject)=>{

            // db.all(`SELECT A.discountID, A.discountProductList,B.discountName FROM discountProductMap AS A INNER JOIN discountMaster AS B ON A.discountID = B.discountID WHERE A.discountProductList = ${productID} ORDER BY A.discountID`,function(error,rows){
                db.get(`SELECT * FROM discountMaster where discountID = ${discount[i].discountID}`,function(error,rows){
                if(error){
                    console.log(error);
                }
                else{
                    resolve(rows)
                }
            })
        })

        if(x.activityClassification == 'STPR'){
            schemes.push(x);
        }
    }

    console.log(schemes)
    // return;

    $('#schemesTable').empty();

    if(schemes.length == 0){
        
        let div = '<div style="padding:16px; border-bottom:solid 1px #d7d7d7">No Schemes Available !!</div>';
        $('#schemesTable').append(div);
    }
    else
    {
        for(let i=0;i<schemes.length;i++)
        {
            $('#schemesTable').append(discountLevels(schemes[i]));
        }
    }

    $('#schemesModal').modal('show');
}

function discountLevels(row){

    return '<div class="card"><div class="card-header"><div class="flex-row" data-toggle="collapse" data-target=#'+row.discountID+' onclick=handleDiscounts(this) aria-expanded="false" aria-controls='+row.discountID+' style="cursor:pointer; padding:16px; border-bottom:solid 1px #d7d7d7; justify-content:space-between"><span>'+row.discountName+'</span><button style="margin:0px;" class="btnBlue">View</button></div></div><div class="collapse" id='+row.discountID+' data-parent="#schemesTable"><div class="card-body" style="border-bottom:solid 1px #d5d5d5; padding-top:10px;padding-bottom:20px;" id=discountTable'+row.discountID+'></div></div></div>';
}

async function handleDiscounts(element){

    var discountID = $(element).data("target")
    discountID = discountID.substr(1,discountID.length);
    console.log(discountID)

    var data = await new Promise((resolve,reject)=>{

        db.all(`SELECT discountID,fromQuantity, toQuantity, schemeBasis, value, forEvery from discountLevel WHERE discountID=${discountID}`,function(error,rows){
            if(error){
                console.log(error);
            }
            else{
                resolve(rows)
            }
        })
    })
    console.log(data)

    for(let i=0;i<schemes.length;i++){
        
        if(schemes[i].discountID != discountID)
        {
            console.log('hide ',schemes[i].discountID)
            $('#'+schemes[i].discountID).collapse('hide');
        }
    }

    var discountTable = '#discountTable'+discountID;
    $(discountTable).empty();

    var li = '<div class="flex-row" style="padding-left:20px;">'+'<span class="accordian-th-columns">fromQuantity</span>'+'<span class="accordian-th-columns">toQuantity</span>'
            +'<span class="accordian-th-columns">Scheme Basis</span>'+'<span class="accordian-th-columns">for every</span>'
            +'<span class="accordian-th-columns">Value</span>'+'</div>';
            
    $(discountTable).append(li);

    for(let i=0;i<data.length;i++)
    {
        li = '<div class="flex-row" style="padding-left:20px;">'+'<span class="accordian-td-columns">'+data[i].fromQuantity+'</span>'+'<span class="accordian-td-columns">'+data[i].toQuantity+'</span>'
            +'<span class="accordian-td-columns">'+data[i].schemeBasis+'</span>'+'<span class="accordian-td-columns">'+data[i].forEvery+'</span>'
            +'<span class="accordian-td-columns">'+data[i].value+'</span>'+'</div>';
        
        $(discountTable).append(li);
    }            

}

async function getProducts(){

    var closingStock = $('#switchOption1').val();
    var products;
    console.log('getProducts',closingStock);
    loader(1);
    if(closingStock == '1'){
    
        products = await new Promise((resolve,reject)=>{

            db.all('SELECT DISTINCT B.productID, A.brandID, A.productName, A.categoryName, A.brandName, A.lowStockAlertQuantity, SUM(B.inventory) as inventory, A.mrp, A.price from batchProductVariants AS B INNER JOIN products AS A ON A.productID = B.productID   GROUP BY B.productID HAVING SUM(B.inventory) > 0 ORDER BY B.productID',function(error,rows){

                if(error){
                    console.log(error)
                }
                else{
                    resolve(rows)
                    
                }
            })

        })
    }
    else{

        products = await new Promise((resolve,reject)=>{

            db.all('SELECT DISTINCT B.productID, A.brandID, A.productName, A.categoryName, A.brandName, A.lowStockAlertQuantity, SUM(B.inventory) as inventory, A.mrp, A.price from batchProductVariants AS B INNER JOIN products AS A ON A.productID = B.productID GROUP BY B.productID ORDER BY B.productID',function(error,rows){

                if(error){
                    console.log(error)
                }
                else{
                    resolve(rows)
                    console.log(rows.length);
                }
            })

        })
    }
        
    await getAllSchemeProducts(products);

    $('#productsTable').bootstrapTable('destroy')
    $('#productsTable').bootstrapTable(
        {
            data:products,
            search:true,
            reinit: true,
            trimOnSearch:false,
            pagination:true
        }
    );
    $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
    $('.customInputSearchDiv').addClass('flex-row margin-20')
    loader(0);
}

function getClosingStock(){

    var v = $('#switchOption1').val();
    console.log(v)

    if(v == 1){
        $('#switchOption1').val(0);
    }
    else{
        $('#switchOption1').val(1);
    }

    getProducts();
}

function getNormProducts(){

    var v = $('#switchOption2').val();
    console.log(v)

    if(v == 1){

        $('#switchOption2').val(0);

        db.all('SELECT DISTINCT B.productID, A.brandID, A.productName, A.categoryName, A.brandName, A.lowStockAlertQuantity, SUM(B.inventory) as inventory, A.mrp, A.price from batchProductVariants AS B INNER JOIN products AS A ON A.productID = B.productID AND A.lowStockAlertQuantity != "" GROUP BY B.productID ORDER BY B.productID',function(error,rows){

            if(error){
                console.log(error)
            }
            else{
                console.log(rows)
                $('#productsTable').bootstrapTable('destroy')
                $('#productsTable').bootstrapTable(
                    {
                        data:rows,
                        search:true,
                        reinit: true,
                        trimOnSearch:false,
                        pagination:true
                    }
                );
                $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                $('.customInputSearchDiv').addClass('flex-row margin-20')
            }

        })
    }
    else{
        $('#switchOption2').val(1);
        getProducts();
    }
}

function populateBrands(){
    $('#brands').empty();
    let x = $('#incomeHead').val()
    $('#select2-chosen-2').html("Select Brand")
    $('#productsTable').bootstrapTable('destroy')
    
    db.all(`SELECT DISTINCT brandID,brandName FROM products WHERE incomeHead LIKE  '%${x}%' GROUP BY brandID ORDER BY brandName`, function(err, row) {
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{           
            brandsData = row;
            console.log(brandsData,'brandsData')
            if(brandsData.length){
                $("#brands").html('<option>Select Brand</option><option>All Brands</option>');
                brandsData.map(m=>{
                    brandNameData = m.brandName;
                    brandIdData = m.brandID;
                    element = '<option value='+brandIdData+'>'+brandNameData+'</option>'
                    $('#brands').append(element);
                })
            }
            else{
                $("#brands").html('<option>Select Brand</option>');
            }
        }
    });
}

function populateProducts(){
    let brandsValue = $("#brands").val()
    let incomeHeadValue = $('#incomeHead').val()

    if(brandsValue!="Select Brand"){
        if(brandsValue =="All Brands" ){
            db.all(`SELECT productID, brandID, productName, categoryName, brandName, inventoryValue, inventoryAmount, mrp, price from products WHERE incomeHead LIKE  '%${incomeHeadValue}%'`,function(err,row){
                if(err){
                    console.log(err)
                    isError(fetchingErrMsg,reRenderLocation)
                }
                else{                
                    if(row.length){
                        productsData = row;
                        console.log(productsData,'productsData')

                        $('#productsTable').bootstrapTable('destroy')
                        
                        $('#productsTable').bootstrapTable(
                        {
                            data:productsData,
                            search:true,
                            reinit: true,
                            trimOnSearch:false,
                            pagination:true,
                        
                        });

                        $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                        $('.customInputSearchDiv').addClass('flex-row margin-20')
                    }
                }
          });

        }
        else{
            db.all(`SELECT productID, brandID, productName, categoryName, brandName, inventoryValue, inventoryAmount, mrp, price from products WHERE brandID IN (${brandsValue}) AND incomeHead LIKE  '%${incomeHeadValue}%'`,function(err,row){
                if(err){
                    console.log(err)
                    isError(fetchingErrMsg,reRenderLocation)
                }
                else{                
                    if(row.length){
                        productsData = row;
                        console.log(productsData,'productsData')
                        $('#productsTable').bootstrapTable('destroy')
                        $('#productsTable').bootstrapTable(
                        {
                            data:productsData,
                            search:true,
                            reinit: true,
                            trimOnSearch:false,
                            pagination:true,
                        
                        });
                        $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                        $('.customInputSearchDiv').addClass('flex-row margin-20')
                    }
                }
          });
        }
    }
    else{
        $('#productsTable').bootstrapTable('destroy')
        var message ='Select Brand!'
        isError(message)
    }
}

function renderTime(value,row){

   var x = reverse(row.manufacturingDate);
   x = x.substr(3,x.length);
   return x;
}

function reverse(date){

   return date.split("-").reverse().join("-");
}

function closeModal(name){

    $('#'+name).modal('hide');
}

    async function getAllSchemeProducts(finalProductData)
    {

        var schemeProductsData = await new Promise((resolve,reject)=>{
            
            db.all(`SELECT B.discountID , c.discountProductList FROM discountCustomerMap AS A INNER JOIN discountMaster AS B ON A.discountID = B.discountID INNER JOIN discountProductMap AS C ON B.discountID = C.discountID WHERE  B.activityClassification='STPR' AND B.isCashDiscount = 0`,(err,data)=>{
                if(err){
                    console.log(err)
                }
                else{
                    resolve(data)
                }
            });
        })

        var allProdArray = [];
        schemeProductsData.map(m=>{
        var prodArry = (m.discountProductList).split(",")
        allProdArray.push(...prodArry)
        })
        
        filteredFinalSchemeProdData = finalProductData.filter(o2 => allProdArray.some(o1 => o1== o2.productID));
        console.log(filteredFinalSchemeProdData,'filteredFinalSchemeProdData')

        finalProductData.map(n=>{

            filteredFinalSchemeProdData.map(l=>{

                if(l.productID==n.productID){
                    n['stprSchemeApplied'] = true
                }
            })
        })

    }


    function renderProdName(value,row)
    {

        if(row.stprSchemeApplied){
            return `<span type='text' >${row.productName}<img style="width:20px; height:20px; margin-left:10px;" src="../../assets/img/percentIcon.png" class='stprIcon' /></span>`;
        }
        else{
            return `<span type='text' >${row.productName}</span>`;
        }
    }