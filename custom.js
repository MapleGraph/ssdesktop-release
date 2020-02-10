handleSchemes=(batchDataWithBP,discountProductList,discountAppliedIDs,discountDetails,discountLevelList,discountClusters)=>{
    console.log(batchDataWithBP,'batchDataWithBP')
    console.log(discountProductList,'discountProductList')

    console.log(discountAppliedIDs,'discountAppliedIDs')
    console.log(discountDetails,'discountDetails')
    console.log(discountLevelList,'discountLevelList')
    console.log(discountClusters,'discountClusters')

    let sDiscountProductList=discountProductList;
    let sDiscountAppliedIDs=discountAppliedIDs;
    let sDiscountDetails = discountDetails;
    let sDiscountLevelList=discountLevelList;
    let sDiscountClusters = discountClusters;
    discountedSBatchData =  batchDataWithBP
    sDiscountAppliedIDs.map(a=>{
        sDiscountProductList.map((b)=>{
            appliedDiscountLevel = []
            appliedDiscountDetails = [];
            if(a.discountID == b.discountID){
                appliedDiscountID = b.discountID

                prodArry =  (b.discountProductList).split(",")
                batchArry =  (b.discountProdBatchVariantList).split("|")
                batchArry.pop()
                eligibleQuant = 0;
                eligibleValue = 0;
                eligibleValueByActualPrice = 0;
                eligibleWeight = 0;
                eligibleQuantValue = 0;
                eligibleTotalWeightValue = 0;
                applicableCartBatches = []
                console.log(appliedDiscountID,'appliedDiscountID2',prodArry,batchArry)
                
                prodArry.map((c,i)=>{
                    filteredCartBatches = []
                    if(c=='ALL'){
                        filteredCartBatches = discountedSBatchData
                    }
                    else{
                        
                        if(batchArry[i]=='ALL'){
                            filteredCartBatches = discountedSBatchData.filter(d=>c==d.productID)
                            console.log('pp22',filteredCartBatches,discountedSBatchData)
                        }
                        else{
                            if(batchArry[i]){
                                eligibleBatchesID = batchArry[i].split(",")
                                filteredCartBatches = discountedSBatchData.filter(o2 => eligibleBatchesID.some(o1 => o1== o2.batchVarRefID));
                            }
                        }
                    }
                    if(filteredCartBatches.length){
                        applicableCartBatches = [...applicableCartBatches,...filteredCartBatches]
                    }
                })
                
                applicableCartBatches=applicableCartBatches.filter(z=>z.sbomDesc != 'LSBOM-C')
                if(applicableCartBatches.length){
                    console.log(applicableCartBatches,'applicableCartBatches',appliedDiscountID,'appliedDiscountID')
                    var cumBilledQty;
                    var billedQty;
                    var billedValue;
                    var billSchemeValue;
                    var discountValue;
                    var finalDiscountValue;

                    applicableCartBatches.map(e=>{
                        eligibleQuant +=e.quantityOrdered
                        eligibleValue +=(e.productBasePrice*e.quantityOrdered)
                        eligibleValueByActualPrice +=(e.productActualPrice*e.quantityOrdered)
                        eligibleQuantValue +=(e.productBasePrice*e.quantityOrdered)
                        if(e.weightUnit == "GMS" || e.weightUnit == "ML"){
                            eligibleWeight +=(e.quantityOrdered*e.weight/1000)
                            eligibleTotalWeightValue +=(e.productBasePrice*e.weight*e.quantityOrdered/1000)
                        }
                        else{
                            eligibleWeight +=(e.quantityOrdered*e.weight)
                            eligibleTotalWeightValue +=(e.productBasePrice*e.weight*e.quantityOrdered) 
                        }
                    })
                    
                    var eligibleValueByActualPriceRounded = parseInt(eligibleValueByActualPrice)
                    var eligibleWeightRounded = parseInt(eligibleWeight)

                    appliedDiscountDetailsObj = sDiscountDetails.find(f=>f.discountID == appliedDiscountID)

                    appliedDiscountLevel = sDiscountLevelList.filter(g=>g.discountID ==appliedDiscountID)

                    console.log(appliedDiscountDetailsObj.activityClassification,applicableCartBatches)

                    
                        console.log('arhaaaa haaiiii',appliedDiscountID)
                        eligibleAppliedDiscountLevel = {}
                        var discountSchemeBasis = appliedDiscountLevel[0].schemeBasis
                        switch(discountSchemeBasis){
                            case 'UNIT':
                            eligibleAppliedDiscountLevel = appliedDiscountLevel.find(h=>(eligibleQuant >= h.fromQuantity &&  eligibleQuant <= h.toQuantity))
                            break;
    
                            case 'VALUE':
                            eligibleAppliedDiscountLevel = appliedDiscountLevel.find(h=>(eligibleValueByActualPriceRounded >= h.fromQuantity &&  eligibleValueByActualPriceRounded <= h.toQuantity))
                            break;
    
                            case 'WEIGHT':
                            eligibleAppliedDiscountLevel = appliedDiscountLevel.find(h=>(eligibleWeightRounded >= h.fromQuantity &&  eligibleWeightRounded<= h.toQuantity))
                            break;
                        }
                        console.log(discountSchemeBasis,'discountSchemeBasis',eligibleWeight,'eligibleWeight',eligibleAppliedDiscountLevel)
                        if(eligibleAppliedDiscountLevel){
                            if(discountSchemeBasis == 'WEIGHT'){
                                var discountType = eligibleAppliedDiscountLevel.discountType
        
                                cumBilledQty = eligibleWeight;
                                billedQty = parseInt(cumBilledQty /eligibleAppliedDiscountLevel.forEvery);
        
                                cumBilledValue= eligibleQuantValue
                                billSchemeValue =(billedQty * eligibleAppliedDiscountLevel.forEvery) * (cumBilledValue / cumBilledQty);
                               // billSchemeValue =parseFloat((billedQty * eligibleAppliedDiscountLevel.forEvery) * (cumBilledValue / cumBilledQty).toFixed(3));
                                
                                totalValue = eligibleTotalWeightValue
    
                                console.log(eligibleTotalWeightValue,eligibleWeight)
                                if(discountType == 'PERCENTAGE'){
                                    applicableCartBatches.map((j)=>{
                                        cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                        if(j.weightUnit == "GMS" || j.weightUnit == "ML"  ){
                                            lineWeight = j.productBasePrice*j.quantityOrdered*j.weight/1000
                                        }
                                        else{
                                            lineWeight = j.productBasePrice*j.quantityOrdered*j.weight
                                        }
                                        discountValue =(billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100);
                                       // discountValue =parseFloat((billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100).toFixed(3));
                                        finalDiscountValue = (discountValue / totalValue * (lineWeight));
                                        cDiscountDetailsObj['discountPrice'] =  eligibleAppliedDiscountLevel.discountValue
                                        cDiscountDetailsObj['discountValue'] = parseFloat(finalDiscountValue.toFixed(3))
                                        cDiscountDetailsObj['discountType'] = 'PERCENTAGE'
                                        console.log(lineWeight,'lineWeight')
                                        if(j.discounts){
                                            j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                            j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                        }else{        
                                            j['discounts'] = [cDiscountDetailsObj]
                                        }
                                        discntArry =   j.discounts
                                        discSum = 0
                                        discntArry.map(v=>{
                                            discSum += v.discountValue
                                        })
                                        j['discountValues'] = parseFloat(discSum.toFixed(3))
                                        console.log(j,'jj22')
                                    })
                                    return false
                                }
                                else if(discountType == 'ABSOLUTE'){
                                    applicableCartBatches.map((j)=>{
                                        cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                        if(j.weightUnit == "GMS" || j.weightUnit == "ML" ){
                                            lineWeight = j.productBasePrice*j.quantityOrdered*j.weight/1000
                                        }
                                        else{
                                            lineWeight = j.productBasePrice*j.quantityOrdered*j.weight
                                        }
                                        console.log(lineWeight,'lineWeight')
                                        var revereseTax = (j.totalTaxPercentage+100)/100
                                        //var revereseTax = parseFloat(((j.totalTaxPercentage+100)/100)).toFixed(3)
                                        discountValue = (billedQty * eligibleAppliedDiscountLevel.discountValue/ revereseTax)
                                        //discountValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.discountValue/ revereseTax).toFixed(3))
                                        finalDiscountValue = (discountValue*lineWeight / cumBilledValue)
        
                                        cDiscountDetailsObj['discountPrice'] =  eligibleAppliedDiscountLevel.discountValue
                                        cDiscountDetailsObj['discountValue'] = parseFloat(finalDiscountValue.toFixed(3))
                                        cDiscountDetailsObj['discountType'] = 'ABSOLUTE'
    
                                        if(j.discounts){
                                            j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                            j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                        }else{        
                                            j['discounts'] = [cDiscountDetailsObj]
                                        }
                                        discntArry =   j.discounts
                                        discSum = 0
                                        discntArry.map(v=>{
                                            discSum += v.discountValue
                                        })
                                        j.discountValues = parseFloat(discSum.toFixed(3))
                                    })
        
                                }
                            }
        
        
                            else if(discountSchemeBasis == 'VALUE'){
                                var discountType = eligibleAppliedDiscountLevel.discountType
        
                                cumBilledQty = eligibleQuant;
                                billedQty = parseInt(cumBilledQty/eligibleAppliedDiscountLevel.forEvery)
        
                                billedValue = eligibleValueByActualPrice;
        
                                billSchemeValue = (billedQty * eligibleAppliedDiscountLevel.forEvery * (billedValue / cumBilledQty))
                                //billSchemeValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.forEvery * (billedValue / cumBilledQty)).toFixed(3));
                                
                                if(discountType == 'PERCENTAGE'){
                                    applicableCartBatches.map((j)=>{
                                        cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj)); 
                                        var linePrice = j.productBasePrice*j.quantityOrdered;
        
                                        discountValue =(billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100)
                                       // discountValue =parseFloat((billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100).toFixed(3));
                                        finalDiscountValue = (discountValue / billedValue * (linePrice))
                                        
                                        cDiscountDetailsObj['discountPrice'] =  eligibleAppliedDiscountLevel.discountValue
                                        cDiscountDetailsObj['discountValue'] =  parseFloat(finalDiscountValue.toFixed(3))
                                        cDiscountDetailsObj['discountType'] = 'PERCENTAGE'
                                        
                                        if(j.discounts){
                                            j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                            j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                        }else{        
                                            j['discounts'] = [cDiscountDetailsObj]
                                        }
                                        discntArry =   j.discounts
                                        discSum = 0
                                        discntArry.map(v=>{
                                            discSum += v.discountValue
                                        })
                                        j.discountValues = parseFloat(discSum.toFixed(3))
                                    })
                                }
                                else if(discountType == 'ABSOLUTE'){
                                    applicableCartBatches.map((j)=>{
                                        cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                        var lineQuant =j.quantityOrdered
                                        discountValue = (billedQty * eligibleAppliedDiscountLevel.discountValue)
                                        //discountValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.discountValue).toFixed(3))
                                        finalDiscountValue = (discountValue*lineQuant / cumBilledQty)
                                        //finalDiscountValue = parseFloat((discountValue*lineQuant / cumBilledQty).toFixed(3))

                                        cDiscountDetailsObj['discountPrice'] =  eligibleAppliedDiscountLevel.discountValue
                                        cDiscountDetailsObj['discountValue'] =   parseFloat(finalDiscountValue.toFixed(3))
                                        cDiscountDetailsObj['discountType'] = 'ABSOLUTE'
                                        if(j.discounts){
                                            j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                            j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                        }else{        
                                            j['discounts'] = [cDiscountDetailsObj]
                                        }
                                        discntArry =   j.discounts
                                        discSum = 0
                                        discntArry.map(v=>{
                                            discSum += v.discountValue
                                        })
                                        j.discountValues = parseFloat(discSum.toFixed(3))
                                    })
        
                                }
                            }
        
                            else if(discountSchemeBasis == 'UNIT'){
                                var discountType = eligibleAppliedDiscountLevel.discountType
        
                                cumBilledQty = eligibleQuant;
                                billedQty = parseInt(cumBilledQty/eligibleAppliedDiscountLevel.forEvery)
        
                                billedValue = eligibleValue;
        
                                billSchemeValue = (billedQty * eligibleAppliedDiscountLevel.forEvery * (billedValue / cumBilledQty))
                                //billSchemeValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.forEvery * (billedValue / cumBilledQty)).toFixed(3));
                                
                                if(discountType == 'PERCENTAGE'){
                                    applicableCartBatches.map((j)=>{
                                        cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                        var linePrice = j.productBasePrice*j.quantityOrdered
                                        //discountValue =parseFloat((billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100).toFixed(3));
                                        discountValue =(billSchemeValue * eligibleAppliedDiscountLevel.discountValue/ 100)

                                        finalDiscountValue = (discountValue / billedValue * (linePrice))
                                        cDiscountDetailsObj['discountPrice'] =  eligibleAppliedDiscountLevel.discountValue
                                        cDiscountDetailsObj['discountValue'] =    parseFloat(finalDiscountValue.toFixed(3))
                                        cDiscountDetailsObj['discountType'] = 'PERCENTAGE'
                                        if(j.discounts){
                                            j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                            j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                        }else{        
                                            j['discounts'] = [cDiscountDetailsObj]
                                        }
                                        discntArry =   j.discounts
                                        discSum = 0
                                        discntArry.map(v=>{
                                            discSum += v.discountValue
                                        })
                                        j.discountValues = parseFloat(discSum.toFixed(3))
                                    })
                                }
                                else if(discountType == 'ABSOLUTE'){
                                    applicableCartBatches.map((j)=>{
                                        cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                                        var lineQuant =j.quantityOrdered
                                        var revereseTax = (j.totalTaxPercentage+100)/100;
                                        //var revereseTax = parseFloat(((j.totalTaxPercentage+100)/100)).toFixed(3)
                                        discountValue = (billedQty * eligibleAppliedDiscountLevel.discountValue/ revereseTax)
                                        //discountValue = parseFloat((billedQty * eligibleAppliedDiscountLevel.discountValue/ revereseTax).toFixed(3))
                                        finalDiscountValue = (discountValue*lineQuant / cumBilledQty)
                                        //finalDiscountValue = parseFloat((discountValue*lineQuant / cumBilledQty).toFixed(3))
                                        
                                        cDiscountDetailsObj['discountPrice'] =  eligibleAppliedDiscountLevel.discountValue
                                        cDiscountDetailsObj['discountValue'] = parseFloat(finalDiscountValue.toFixed(3))
                                        cDiscountDetailsObj['discountType'] = 'ABSOLUTE'
                                        
                                        if(j.discounts){
                                            j.discounts = j.discounts.filter(k=>k.discountID!=cDiscountDetailsObj.discountID)
                                            j.discounts = [...(j.discounts),cDiscountDetailsObj]
                                        }else{        
                                            j['discounts'] = [cDiscountDetailsObj]
                                        }
                                        discntArry =   j.discounts
                                        discSum = 0
                                        discntArry.map(v=>{
                                            discSum += v.discountValue
                                        })
                                        j.discountValues = parseFloat(discSum.toFixed(3))
                                    })
        
                                }
                            }
                        }
                        // else{
                        //     applicableCartBatches.map((l)=>{ 
                        //         cDiscountDetailsObj = JSON.parse(JSON.stringify(appliedDiscountDetailsObj));
                        //         if(l.discounts){
                        //             l.discounts = l.discounts.filter(m=>m.discountID!=cDiscountDetailsObj.discountID)     
                        //         }
                        //         else{
                        //             l['discounts'] = []
                        //         }
                        //         l['discountValues'] = 0
                        //     })          
                        // }
   

                }
            }
        })
    })
    console.log(discountedSBatchData,'discountedSBatchData')
    return discountedSBatchData
    //handleTaxToCart(discountedSBatchData,productID,type,action)
}

async function syncDiscounts(){

    const route = {routeName:'discounts',tableName:'discountMaster'}
    var rows;

    await api.get(route.routeName)
    .then((res)=>{

        rows = res.data;
    })
    .catch((err)=>{

        console.log(err)
    })

    if (typeof(rows) == "undefined" || rows.length == 0) {
        return false;
    }

    for(let j in rows)
    {   
        console.log(j,rows[j])

        if(rows[j].length == 0)
        {
            continue;
        }

        if(j == 'discountMaster' || j == 'discountCustomerMap' || j == 'discountProductMap' || j == 'discountLevel' || j == 'discountClusters')
        {
            await queryBuilder(j,j,rows[j])
        }
    }
}

async function queryBuilder(tableName,routeName,rows)
{
    let query = "PRAGMA table_info("+tableName+")";
    let deleteQuery = "DELETE FROM "+tableName;

    return new Promise ((resolve, reject) => {

        db.all(query,async function(err,result){

            console.log('schema '+routeName,result);
            
            required = {}
            
            // required object determines which keys from response are present in database table
            // building required object

            for(let key in rows[0]){
                for(let i=0;i<result.length;i++)
                {
                    if(key.toLowerCase() == result[i].name.toLowerCase())
                    {
                        required[key] = 'true';
                        break; 
                    }
                }        
            }

            if(routeName == 'productsTest'){
                required['inventoryAmount'] = 'true';
                required['inventoryValue'] = 'true';
            }

            if(routeName == 'customerInfoApp'){
                required['customerID'] = 'true';
            }

            // console.log('required ',required)
            // return ;

            var keyQuery,valueQuery = '',row,value;
        
            // building the columns of table 

            keyQuery = '(';
            for(let key in required)
            {
            keyQuery += ' ' + key + ',';
            }
            
            keyQuery = keyQuery.substr(0,keyQuery.length-1);
            keyQuery += ')';

            console.log(keyQuery)

            if(routeName == 'productsTest'){
                delete required['inventoryAmount'];
                required['inventoryCost'] = 'true';
                delete required['inventoryValue'];
                required['inventory'] = 'true';
            }

            if(routeName == 'customerInfoApp'){
                delete required['customerID'];
                required['custID'] = 'true';
            }
            // console.log(required)

            // building the values to be inserted
            // row corresponds to each row of table
            // rows = rows.slice(0,1);

            for(let i=0;i<rows.length;i++)
            {
            row = '(';

            for(let key in required)
            {
                if(typeof(rows[i][key]) == 'string'){
                value = JSON.stringify(rows[i][key]);
                }
                else{
                value = rows[i][key];
                }
                row += ' ' + value + ',';
            }
            
            row = row.substring(0,row.length-1);
            row += ')';

            valueQuery += row + ',';
            
            }
            
            valueQuery = valueQuery.substring(0,valueQuery.length-1);

            var finalQuery = 'INSERT INTO '+ tableName + keyQuery+' VALUES '+valueQuery;
            console.log(finalQuery)

            db.serialize(function(){

                
                db.run(deleteQuery,function(err){
                    console.log('delete '+tableName,err)
                });
                

                db.run(finalQuery,function(err){
                    
                    console.log('insert '+tableName,err)
            
                    if(err){
                       console.log(err)
                    }
                    else{
                        resolve();
                    }
                });

            })

        })
    })

}


module.exports =  {
    handleSchemes,
    syncDiscounts
};