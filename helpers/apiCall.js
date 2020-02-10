var axios = require('axios');
var store = JSON.parse(localStorage.getItem('loginResponse'));
var storeID;
var userID;
if(store){
    storeID = store.storeList[0].storeID;
    userID = store.userID;
}
// change this url for production

//uncomment for the Beta API url
//var baseUrl = 'http://13.235.5.156/ssapi/public';

// production API URL 

var baseUrl = 'https://ss.queuebuster.co/ssapi/public';

var access_token = localStorage.getItem('access_token');
var serialNumber = localStorage.getItem('serialNumber');
var deviceID = localStorage.getItem('deviceID');
var apkVersion = localStorage.getItem('apkVersion');

let post = (routeName,data)=>{

    let url = baseUrl + routeName;
    let api;
console.log(url);
    api = axios.post(url,data,
        {
            headers:{
                Authorization:'Bearer '+access_token
            }
        }
    )
    .then((res)=>{
        console.log(res);
        
        return res;
    })
    .catch((err)=>{
        console.log(err);
        
        return err;
    })
    console.log(url);
    console.log(api);
    return  api;
}


let postWithoutStore = async (routeName,data)=>{

    let url = baseUrl+'/v1/merchant/'+ routeName;
    let api;

    await axios.post(url,data,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID,
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })

    // console.log(url);
    // console.log(api);
    return  api;
}

let postByChain = async (routeName,data)=>{

    let url = baseUrl+'/v1/merchant/'+ store.chainID + '/' + routeName;
    let api;

    await axios.post(url,data,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID,
            }
        }
    )
    .then((res)=>{
        
        // console.log(res)
        api = res;
    })
    .catch((error)=>{

        // console.log(error.response)
        api = error.response;
    })

    return  api;
}

let postWithStore = async (routeName,data)=>{

    let url = baseUrl +'/v1/merchant/' + storeID + '/' + routeName;
    let api;

    await axios.post(url,data,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let putWithStore = async (routeName,data)=>{

    let url = baseUrl +'/v1/merchant/' + storeID + '/' + routeName;
    let api;

    await axios.put(url,data,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let get = async (routeName)=>{

    let url = baseUrl +'/v1/merchant/' + storeID + '/' + routeName;
    let api;

    await axios.get(url,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let schemaCall = async (routeName)=>{

    let url = baseUrl+'/v1/merchant/'+ store.chainID + '/' + routeName;
    let api;

    await axios.get(url,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let getByChain = async (routeName)=>{

    let url = baseUrl+'/v1/merchant/'+ store.chainID + '/' + routeName;
    let api;
    console.log(url)
    await axios.get(url,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let getByChainOffset = async (routeName,header)=>{

    let url = baseUrl+'/v1/merchant/'+ store.chainID + '/' + routeName;
    let api;

    header.Authorization = 'Bearer '+access_token;
    header.storeID = storeID

    // console.log('header ',header)
    
    await axios.get(url,
        {
            headers: header
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let deleteByChain = async (routeName,deleteID)=>{

    let url = baseUrl+'/v1/merchant/'+ store.chainID +'/'+deleteID +'/' + routeName;
    let api;
    console.log(url)
    await axios.get(url,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let getBySerialNumber = async(routeName)=>{

    let url = baseUrl + '/v1/merchant/' + storeID + '/' + routeName + '/' + serialNumber;
    let api;
    console.log(url)

    await axios.get(url,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let getByDeviceID = async(routeName)=>{

    let url = baseUrl+'/v1/merchant/'+ store.chainID + '/' + routeName;
    let api;
    console.log(url)

    await axios.get(url,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID,
                deviceID:deviceID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let getByDeviceIDStoreID = async(routeName)=>{

    let url = baseUrl+'/v1/merchant/'+ storeID + '/' + routeName;
    let api;
    console.log(url)

    await axios.get(url,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID,
                deviceID:deviceID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let getLicenseInfo = async(routeName)=>{

    let url = baseUrl+'/v1/merchant/'+ store.licenseNumber + '/' + routeName;
    let api;
    console.log(url)

    await axios.get(url,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;
}

let heartbeat = async(routeName,data)=>{

    let url = baseUrl+'/v1/merchant/' + routeName;
    // let data = {
    //     chainID:1,
    //     licenseNumber: store.licenseNumber,
    //     serialNumber,
    //     storeID,
    //     lastSyncTime:"",
    //     apkVersion,
    //     appName: "SS-DESKTOP"
    // }

    let api;
    // console.log(data)

    await axios.post(url,data,
        {
            headers:{
                Authorization:'Bearer '+access_token,
                storeID:storeID
            }
        }
    )
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    // console.log(api)
    return api;

}


let postWithoutHeaders = async(routeName,data)=>{

    let url = baseUrl + routeName;
    let api;
    
    await axios.post(url,data)
    .then((res)=>{
        
        api = res;
    })
    .catch((err)=>{

        api = err;
    })
    
    return api;

}

module.exports =  {
    post,
    get,
    schemaCall,
    getByChain,
    postByChain,
    postWithoutStore,
    getBySerialNumber,
    getByDeviceID,
    getLicenseInfo,
    storeID,
    postWithStore,
    getByChainOffset,
    heartbeat,
    putWithStore,
    getByDeviceIDStoreID,
    postWithoutHeaders
};