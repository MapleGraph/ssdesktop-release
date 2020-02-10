const basePath = process.env.basepath;
const api = require(basePath+'/helpers/apiCall.js');
var store = JSON.parse(localStorage.getItem('loginResponse'));
var serialNumber = localStorage.getItem('serialNumber');
var apkVersion = localStorage.getItem('apkVersion');
apkVersion = apkVersion?apkVersion:0;

function downloadFile() {
    // Create an invisible A element
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = 'http://13.235.5.156/apk/restrictEntry/debug/desktop/ssapp.exe';
    a.setAttribute("download",'');

    console.log(a)

    document.body.appendChild(a);
        
    // Trigger the download by simulating click
    a.click();
    document.body.removeChild(a);
}

function openDialog(){

    var dialogOptions = {type: 'info', buttons: ['Update'], message: 'New version available ! Update to new version'}
                
    dialog.showMessageBox(dialogOptions, async i => {
        
        console.log(i)

        if(i == 0){

            downloadFile();
        }
    }) 
}

function updateBuild(){

    var data = {
        chainID:1,
        licenseNumber: store.licenseNumber,
        serialNumber,
        storeID: store.storeList[0].storeID,
        lastSyncTime:"",
        apkVersion,
        appName: "SS-DESKTOP"
    }
    
    console.log(data)

    api.heartbeat('heartbeat',data)
    .then((res)=>{
        console.log(res)

        if(res.data.apkVersion > apkVersion){

            console.log('update')
            openDialog();
        }
    })
    .catch((err)=>{
        console.log(err)
    })
    
}

module.exports = {updateBuild};