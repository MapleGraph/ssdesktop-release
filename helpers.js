const jsPDF = require('jspdf');
require ("jspdf-autotable");

const printer = require('pdf-to-printer'); console.log(" path is =" +printer);
const ipc = require('electron').ipcRenderer
const fs = require('fs')
const os1 = require('os');

var storeName='' ;
var storeGUID=0;
var storeID = 0;
var store = JSON.parse(localStorage.getItem('loginResponse'));
var storeInfo;

if(store){
  storeInfo = store.storeList[0]
}

if(store && storeInfo){
  storeID = storeInfo.storeID
  storeGUID = storeInfo.storeGUID;
  storeName = storeInfo.storeName;
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /*loop through a collection of all HTML elements:*/
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /*make an HTTP request using the attribute value as the file name:*/
      xhttp = new XMLHttpRequest(); 
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /*remove the attribute, and call this function once more:*/
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }      
      xhttp.open("GET", file, true);
      xhttp.send();
      /*exit the function:*/
      return;
    }
  } 
};
includeHTML();

var basePath = process.env.basepath;

var pdfResPath = basePath;

if (pdfResPath.indexOf('app.asar') > -1 || os1 === 'WINDOWS') {
    pdfResPath = pdfResPath.replace('app.asar', '')
}

console.log(basePath,'basePath')
imagepath = basePath+"/assets/img"
// console.log(imagepath,'imagepath')
var open = true;
var height = $(window).height()- 56;   

async function  getMenu(title="title"){
  setTimeout(()=>{
    $('#page_title').html(title);
    $('#imgMenu').attr('src',imagepath+"/menu_icon.png");
    // $('.right_content #imgBell').attr('src',imagepath+"/bell_icon.png"); 
    $('.right_content #imgForward').attr('src',imagepath+"/right_icon.png"); 
    $('.right_content #imgBack').attr('src',imagepath+"/left_icon.png"); 
    $('#sidebar').css({'left':'-25%','height':height})
    $('#sidebar #ssName').text(storeName)
    $('#sidebar #ssCode').html(storeGUID)
  },0)
  //await getSidebarHeight()
}

// getSidebarHeight=()=>{
  // var body = document.body,
  // html = document.documentElement;
  // var height = Math.max(
  //   body.scrollHeight, body.offsetHeight, 
  //   html.clientHeight, html.scrollHeight, html.offsetHeight
  // );
//   $('#sidebar').css('height',height)
// }

 downloadPdf=()=>{
};


    function gotoInventory(){
      window.location.href=basePath+"/components/inventory/inventoryDashboard.html"
    }

    function gotoDashboard(){
      window.location.href=basePath+"/components/dashboard.html"
    }

    function gotoUnipay(){
      window.location.href=basePath+"/components/unipay/main.html"
    }

    function gotoManageStock(){
      window.location.href=basePath+"/components/manageStock/stockLevel.html"
    }

    function gotoBilling(){
      window.location.href=basePath+"/components/billing/billingDashboard.html"
    }
    function gotoProductDetails(){
      window.location.href=basePath+"/components/catalogue/productDetails.html"
    }
    function gotoReports(){
      window.location.href=basePath+"/components/reports/report.html"
    }
    function gotoSettings(){
      window.location.href=basePath+"/components/settings/settings.html"
    }
    

    menuClicked=()=>{
       if(open){
         $('#sidebar').show().animate({
           left: '0%'
         });
         $('#content').animate({
          left: '10%',
           width:'70%'
        });
         open = false
       }
       else{
        $('#sidebar').animate({
          left: '-20%'
        });
        $('#content').animate({
          left: '0%',
          width:'90%'
        });
        open = true
       }
    }
    
    function loader(param){
      if (param == 1) {
        window.scrollTo(0,0);
        document.getElementById("customLoader").style.display = "block";
      }else{
        document.getElementById("customLoader").style.display = "none";
      }
      
    }

    isError=(message,location)=>{
      var dialogOptions = {type: 'info', buttons: ['OK'], message: message}
      dialog.showMessageBox(dialogOptions, async i => {
          if(!i){
            if(location){
              window.location.href=location
            }
          }
      })
      return false
  }

  resetTableSearch=()=>{
    $('table').bootstrapTable("resetSearch","");
      $('.tableResetSearchImage').css('display','none')
  }
  displaySearchButton=()=>{
      $('.tableResetSearchImage').css('display','flex')
  }

  getTaxTableData=async(tableData)=>{
    var taxList = await new Promise((resolve,reject)=>{
      db.all(`SELECT * FROM taxes`,function(err,data){
          if(err){
              console.log(err)
          }
          else{
              resolve(data);
          }
      })
    })

    var allTaxArr = [];  
    tableData.map(m=>{
        var taxes = m.taxes
        taxes.map(n=>{
          var taxLabel = n.taxName.split('@')
          m[`${taxLabel[0]}`] = n.taxValue
          n['taxalbleAmt'] = m.taxableValue
        })
        allTaxArr.push(...taxes)
    })
  
    var allAppliedTaxes= []
    taxList.map(a=>{
        var taxTotal = 0
        var sTax = []
        var obj;
        sTax = allTaxArr.filter(b=>b.taxID == a.taxID)
        var taxalbleAmt = 0
        sTax.map(c=>{
            taxTotal += c.taxValue
            taxTotal = parseFloat(taxTotal.toFixed(3))
  
            taxalbleAmt+= c.taxalbleAmt
            taxalbleAmt = parseFloat(taxalbleAmt.toFixed(3))
            obj = {...c,'taxValue':taxTotal,'taxalbleAmt':taxalbleAmt}
        })
        if(obj){
            allAppliedTaxes.push(obj)
        }        
    })
    var p = new Promise((resolve,reject)=>{
      resolve(allAppliedTaxes)
    })
    return allAppliedTaxes
  }

  getTitle=(doc,docInfo)=>{
    doc.setTextColor('#f00')
    doc.setFont("courier");
    doc.setFontStyle("bold");
    var xOffsetCenter = ((doc.internal.pageSize.width)-15 )/2
    doc.text(`${docInfo.title}`,xOffsetCenter,15,null,null,'center')
  }

  getStoreDetails=async(doc)=>{
    var storeData = await new Promise((resolve,reject)=>{    
      db.get(`SELECT * FROM listStores where storeID = ${storeID}`,function(err,data){
          if(err){
              console.log(err)
          }
          else{
              resolve(data);
          }
      })
    })

    doc.setTextColor('#000')
    doc.setFont("helvetica");
    doc.setFontStyle("normal");

    doc.text( `${storeData.storeName} `, 15, 25);
    doc.text( `${storeData.outletAddLine1} `, 15, 29);
    doc.text( `${storeData.outletAddLine2} `, 15, 33);
    doc.text( `${storeData.outletAddCity} `, 15, 37);
    doc.text( `Contact No : ${storeData.outletPhone} `, 15, 41);
    doc.text( `GSTIN: ${storeData.gstNumber} `, 15, 45);
  }


  getBillDetails=(doc,billInfo,xOffset)=>{
    if(billInfo.invoiceNo){
      doc.text( `Invoice No. : ${billInfo.invoiceNo} `, xOffset, 21, null, null, 'right');
    }
    if(billInfo.orderNo){
      doc.text( `Order No. : ${billInfo.orderNo} `, xOffset, 25, null, null, 'right');
    }
    if(billInfo.billNo){
      doc.text( `Bill No. : ${billInfo.billNo} `, xOffset, 29, null, null, 'right');
    }
    doc.text( `Bill Time : ${billInfo.billTime} `, xOffset, 33, null, null, 'right');
  }

  getRetailerDetails=(doc,retailerInfo,xOffset)=>{
    doc.setFont("courier");
    doc.setFontStyle("bold");
    doc.text('Retailer', xOffset, 50, null, null, 'right')

    doc.setTextColor('#000')
    doc.setFont("helvetica");
    doc.setFontStyle("normal");

    doc.text( `${retailerInfo.firstName} `,xOffset, 55, null, null, 'right');
    if(retailerInfo.address){
      var adressData = retailerInfo.address
        doc.text( `${adressData.addressLine1} `,xOffset, 59, null, null, 'right');
        doc.text( `${adressData.addressLine2} `,xOffset, 63, null, null, 'right');
        doc.text( `${adressData.city} `,xOffset, 67, null, null, 'right');

        doc.text( `Contact No : ${retailerInfo.phone} `,xOffset, 71, null, null, 'right');
        doc.text( `GSTIN: ${retailerInfo.gstNumber} `,xOffset, 75, null, null, 'right');
    }
    else{
      doc.text( `Contact No : ${retailerInfo.phone} `,xOffset, 59, null, null, 'right');
      doc.text( `GSTIN: ${retailerInfo.gstNumber} `,xOffset, 63, null, null, 'right');
    }
  }

  getVendorDetails=(doc,vendorInfo,xOffset)=>{
    doc.setFont("courier");
    doc.setFontStyle("bold");
    doc.text('Vendor', xOffset, 50, null, null, 'right')

    doc.setTextColor('#000')
    doc.setFont("helvetica");
    doc.setFontStyle("normal");

    doc.text( `${vendorInfo.vendorName} `,xOffset, 55, null, null, 'right');
    doc.text( `RS Code : ${vendorInfo.vendorGUID} `,xOffset, 59, null, null, 'right');
    doc.text( `GSTIN ID: ${vendorInfo.GSTNumber} `,xOffset, 63, null, null, 'right');

  }

  getTableOne=(doc,tableOnecolumns,tableData,tableOneInitPos)=>{
    doc.autoTable(tableOnecolumns, tableData, {
      startY: tableOneInitPos+10,
      theme: 'grid',  
      tableWidth: 'auto', 
      columnWidth: 'wrap', 
      showHeader: 'everyPage',
      tableLineColor: 200, 
      tableLineWidth: 0,
      margin: { horizontal: 10 },
      headerStyles: {theme: 'grid'},
      styles: { overflow: "linebreak",fontSize:'8',},
      headerStyles:{fillColor: '#c7c7c7',textColor:'#000'},
      bodyStyles: { valign: "top" },
      theme: "grid"
  });
  }

  getOrderDetails=(doc,orderInfo,xOffset)=>{
    let tableOneEndPos = doc.autoTable.previous.finalY; // The y position on the page

    var rounding = 0
    if('rounding' in orderInfo){
      rounding = orderInfo.rounding 
    }
    var roundedTotal = (parseFloat(orderInfo.totalPrice) - parseFloat(rounding)).toFixed(3)
    doc.text(`${orderInfo.totalItems} items : ${roundedTotal} `, xOffset, tableOneEndPos+10, null, null, 'right');

    doc.setTextColor('#f00')
    doc.setFont("courier");

    if('rounding' in orderInfo){
      doc.text( `Rounding : ${orderInfo.rounding} `, xOffset, tableOneEndPos+19, null, null, 'right');
    }
    
  
    doc.text( `Total Amount : ${orderInfo.totalPrice} `, xOffset, tableOneEndPos+15, null, null, 'right');

    if('discountValue' in orderInfo){
      doc.text( `Discount Applied : ${orderInfo.discountValue} `, xOffset, tableOneEndPos+23, null, null, 'right');
    }
    if('cashDiscountInfo' in orderInfo){
      doc.text( `Total Cash discount( ${orderInfo.cashDiscountInfo.cashDiscPercent}% ) : ${orderInfo.cashDiscountInfo.cashDiscount} `, xOffset, tableOneEndPos+27, null, null, 'right');
    }
    if('creditNotesInfo' in orderInfo){
      doc.text( `Credit Adjustment : ${orderInfo.creditNotesInfo.creditNotesAdjust} `, xOffset, tableOneEndPos+31, null, null, 'right');
      doc.text( `Payable Amount : ${orderInfo.creditNotesInfo.payableAmnt} `, xOffset, tableOneEndPos+35, null, null, 'right');
    }
    if('unipayInfo' in orderInfo){
      doc.text( `Debit Adjustment : ${orderInfo.unipayInfo.debitNoteAdj} `, xOffset, tableOneEndPos+27, null, null, 'right');
      doc.text( `Credit Adjustment : ${orderInfo.unipayInfo.creditNoteAdj} `, xOffset, tableOneEndPos+31, null, null, 'right');
      doc.text( `Ushop Adjustment : ${orderInfo.unipayInfo.unipaySchemeAdj} `, xOffset, tableOneEndPos+35, null, null, 'right');
      doc.text( `Reverse Payout : ${orderInfo.unipayInfo.reversePayout} `, xOffset, tableOneEndPos+39, null, null, 'right');
      doc.text( `Outlet Payout : ${orderInfo.unipayInfo.outletPayout} `, xOffset, tableOneEndPos+43, null, null, 'right');
      doc.text( `Net Payable : ${orderInfo.unipayInfo.netPayable} `, xOffset, tableOneEndPos+47, null, null, 'right');
    }
  }

  getTableTwo=(doc,tableTwocolumns,tableTwoData,docInfo)=>{
     
    var  tableOneEndPos = doc.autoTable.previous.finalY

    if('creditNotesInfo' in docInfo.orderInfo){
      tableOneEndPos =tableOneEndPos+12
    }

    doc.autoTable(tableTwocolumns,tableTwoData, {
      startY: tableOneEndPos+45,
      theme: 'grid',  
      tableWidth: 'auto', 
      columnWidth: 'wrap', 
      showHeader: 'everyPage',
      tableLineColor: 200, 
      tableLineWidth: 0,
      margin: { horizontal: 15 },
      headerStyles: {theme: 'grid'},
      styles: { overflow: "linebreak",fontSize:'8'},
      headerStyles:{fillColor: '#dbdbdb',textColor:'#000'},
      bodyStyles: { valign: "top" },
    
      addPageContent: function(data) {    
          doc.setTextColor('#000')
          doc.setFont("helvetica");
          doc.text( `GST Tax Summary`, 15,  tableOneEndPos+40);
      },
      theme: "grid"
      });
  }

  getCreditNotesDetails=(doc,orderInfo)=>{
    let tableTwoEndPos = doc.autoTable.previous.finalY; 
    doc.text(`Credit Notes`, 15,  tableTwoEndPos+10);
    var creditNotesArray = orderInfo.creditNotesInfo.creditNotesDetails
    if(creditNotesArray.length){
      creditNotesArray.map((m,i)=>{
        if(m.description && (m.description).length){
          doc.text(`${m.description} : (${m.amount})`, 15,tableTwoEndPos+(15+i*5));
        }
        else{
          doc.text(`Credit Note : (${m.amount})`, 15,tableTwoEndPos+(15+i*5));
        }
      })
    }
    else{
      doc.text(`Credit Note (0)`, 15,tableTwoEndPos+15);
    }
  }


printPdf = async(columnsObj,tableData,docInfo) => {

  const doc = new jsPDF();

  var xOffset = (doc.internal.pageSize.width)-15
  var tableOneInitPos = 20

  doc.setFontSize(10);
  doc.setFontStyle("normal");

  getTitle(doc,docInfo)

  if(docInfo.storeInfoShown){
    await getStoreDetails(doc)
    tableOneInitPos = 47
  }

  if('billInfo' in docInfo){
    var billInfo = docInfo.billInfo
    getBillDetails(doc,billInfo,xOffset)
    tableOneInitPos = 47
  }  

  if('retailerInfo' in docInfo){
    var retailerInfo= docInfo.retailerInfo

    getRetailerDetails(doc,retailerInfo,xOffset)

    if(retailerInfo.address && retailerInfo.address.addressLine1 && retailerInfo.address.addressLine1 !=""){
      tableOneInitPos = 75
    }
    else{
      tableOneInitPos = 63
    }
  }

  if('vendorInfo' in docInfo){
    var vendorInfo= docInfo.vendorInfo
    getVendorDetails(doc,vendorInfo,xOffset)
    tableOneInitPos = 63
  }

  if(docInfo.taxShown){
    var tableTwoData = await getTaxTableData(tableData)
  }

  var tableOnecolumns=columnsObj.table1columns;
  getTableOne(doc,tableOnecolumns,tableData,tableOneInitPos)


if('orderInfo' in docInfo){
  var orderInfo= docInfo.orderInfo
  getOrderDetails(doc,orderInfo,xOffset)
}

  if(docInfo.taxShown){
    var tableTwocolumns = columnsObj.table2columns;
    getTableTwo(doc,tableTwocolumns,tableTwoData,docInfo)
  }


  if(docInfo.orderInfo && 'creditNotesInfo' in docInfo.orderInfo){
    var orderInfo= docInfo.orderInfo
    getCreditNotesDetails(doc,orderInfo)
  }

  pdfStr =doc.output('datauristring');        //returns the data uri string

  var docObj = {
    'docStr' : pdfStr,
    'name' : docInfo.fileName
  }

  if(docInfo.action){
    docObj['locationFolder'] = `temp`
    ipc.send('print',docObj)
     doc.save(docInfo.fileName, {returnPromise:true}).then(()=>{
      setTimeout(()=>{
        printer
        .print(`${pdfResPath}/temp/${docInfo.fileName}`)
        .then(()=>{
          fs.unlinkSync(`${pdfResPath}/temp/${docInfo.fileName}`)
          showSuccessModal('print',true,docInfo.fileName)
        })
        .catch((err)=>{
          console.log(err)
          var errMsg = 'Please connect printer!'
          isError(errMsg,docInfo.reRenderLocation)
        });
        // printer
        //   .list()
        //   .then(console.log)
        //   .catch(console.error);
      },1000)
    });
  }
  else{
    docObj['locationFolder'] = `SSPDF`
    ipc.send('print',docObj)
    // if(fs.existsSync(`${pdfResPath}/SSPDF/${docInfo.fileName}`)){
      //   fs.unlinkSync(`${pdfResPath}/SSPDF/${docInfo.fileName}`)
      // }
    doc.save(docInfo.fileName, {returnPromise:true}).then(()=>showSuccessModal('download',true,docInfo.fileName))
    return true
  }

};

showSuccessModal=(action,status,fileName)=>{
  if(status){
    if(action == 'print'){
      $('#successTag').text('Print')
      $('#successTagl').text('printed')
      $('#fileLocation').text('')
      $('.fileName').text(fileName)
      //$('#successModal').modal('show');
    }
    else if(action == 'download'){
      $('#successTag').text('Download')
      $('#successTagl').text('downloaded')
      $('#fileLocation').text(`File Location: SSApp/resources/SSPDF/${fileName}`)
      $('.fileName').text(fileName)
    }
    $('#successModal').modal('show');
  }
}


module.exports =  {
  getMenu,
  loader
};

