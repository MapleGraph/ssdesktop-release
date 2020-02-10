
const routeList = [
                    
    {routeName:'devices',tableName:'devices',label:'Devices'},

    {routeName:'employees',tableName:'users',label:'Users'},

    {routeName:'getRoles',tableName:'roles',label:'Roles'},

    {routeName:'getStoreInfo',tableName:'listStores',label:'Stores List'},

    {routeName:'getChainInfo',tableName:'listChains',label:'Chains List'},

    // {routeName:'productCount',tableName:''},

    {routeName:'chargeList',tableName:'taxes',label: 'Taxes'},

    {routeName:'accounts',tableName:'accountInformation', label:'Accounts'},

    {routeName:'payments',tableName:'globalTypePaymentAccountIDMapping',label:'Payments'},

    {routeName:'global',tableName:'globalType',label:'Global Types'},

    // {routeName:'globaltypes',tableName:'globalTypeValues'},

    {routeName:'productsTest',tableName:'products', label: 'Products'},

    {routeName:'categories',tableName:'category', label: 'Categories'},

    {routeName:'brands',tableName:'brand',label: 'Brands'},

    {routeName:'getAppSettings',tableName:'sharedPref', label:'Shared Preferences'},

    {routeName:'getMaxLogID',tableName:'sharedPref', label : 'Shared Preferences'},

    // {routeName:'getRemarksApp',tableName:'globalRemarks'},

    {routeName:'lastorder'},

    // {routeName:'lastBatch',tableName:'batchInfo'},

    {routeName:'discounts',tableName:'discountMaster',label : 'Discounts'},
    
    {routeName:'getLicenseInfo',tableName:'', label:'License Information'},

    {routeName:'getVendors',tableName:'vendors', label:'Vendors'},

    {routeName:'getStoreListApp',tableName:'storeList', label:'Store List'},

    // {routeName:'inventoryLevel',tableName:'stockLevel'},   no need because of batch level

    {routeName:'customerInfoApp',tableName:'customers' , label:'Customers'},

    // {routeName:'heartbeat':82},

    {routeName:'getDamageClaimList',tableName:'damage', label:'Damage Claim List'},

    {routeName:'getStoreRegionPricing',tableName:'storeRegion' , label:'Store Region Prices'},

    {routeName:'getProductsBatchVariants',tableName:'batchProductVariants' , label:'Product Batch Variants'},

    {routeName:'getWarehouses',tableName:'warehouses',label:'Warehouses'},

    {routeName:'getStockTransferRule',tableName:'stockTransferConf',label:'Stock Transfer Configurations'},

    {routeName:'getMocsApp',tableName:'mocs',label:'MOC List'},

    // {routeName:'getPDPList',tableName:'pdpList',label:'PDP List'}
];

module.exports = routeList;
