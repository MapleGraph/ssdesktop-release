//const sqlite3 = require('sqlite3').verbose();
//const db = new sqlite3.Database('ssDB');
var countVal=0;
var egirCountVal = 0;

var data = {
storeID :storeID, 
}

var fetchingErrMsg='Error in fetching data!'
var reRenderLocation="inventoryDashboard.html"

$(async()=>{ 
    await getMenu('Inventory Dashboard')
    await backNavigation() 
})

backNavigation=()=>{
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href="../dashboard.html"
    })
}

function getDraftCount(){
    db.all(`SELECT COUNT(*) AS plCount FROM stockRequisitionSummary WHERE isDraftMode = 1`,(err,count)=>{
        if(err){
            console.log(err)
                 isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(count.length){     
                countVal= count[0].plCount
                if(countVal){           
                    var url = "orderDraft.html";
                    $("#draftCount").attr("href",url);
                    $('#draftCountBadge').css('display','flex')
                    $('#draftCountBadge').text(countVal);
                }
                checkNewOrderAvail(countVal)
            }
        }
    })
     getPendingDeliveries()
}

checkNewOrderAvail=(countVal)=>{
    if(countVal){
        $('#addNewOrder').click((event)=>{
            event.preventDefault()
            var message = 'In draft you have pending order to place, Please place it first!'
            var location = 'orderDraft.html'
            isError(message,location)
        })

    }else{
        $('#draftCount').click((event)=>{
            event.preventDefault()
            var message = 'No pending order in Draft!'
            var location = ''
            isError(message,location)
        })

    }
}

function getPendingDeliveries(){	
    db.all(`SELECT count(*) as totalCount FROM poSummary AS A WHERE A.status='RECEIVED'`,(err,count)=>{
        if(err){
            console.log(err)
                 isError(fetchingErrMsg,reRenderLocation)
        }
        else{
            if(count.length){
                egirCountVal= count[0].totalCount
                console.log(egirCountVal)
                if(egirCountVal){
                    $('#pendingDeliveryCountBadge').css('display','flex')
                    $('#pendingDeliveryCountBadge').text(egirCountVal)
                }
            }
        }
    })
}

getUrl=()=>{
    if(egirCountVal){
        var url = "pendingDeliveries.html";
        $("#pendingDeliveryCount").attr("href",url);
    }
    else{
        isError('No pending delivery found!')
    }
}
