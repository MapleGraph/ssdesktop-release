var countVal=0;
var fetchingErrMsg='Error in fetching data!'
var reRenderLocation="billingDashboard.html"


$(async()=>{
    await getMenu('Billing Dashboard')
    await backNavigation()
})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href="../dashboard.html"
    })
}

function getPendingPICount(){ 

    db.all(`SELECT count(*) as totalCount FROM piSummary AS A WHERE A.status='RECEIVED'`,(err,count)=>{
        if(err){
            console.log(err)
            isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(count.length){
                countVal= count[0].totalCount
                console.log(countVal)
                if(countVal){
                    var url = "pendingPIList.html";
                    $("#pendingPICount").attr("href",url);
                    $('#pendingPICountBadge').css('display','flex')
                    $('#pendingPICountBadge').text(countVal)
                }
            }
        }
    })
    
}