const electron = require('electron');

const app = electron.app;

const path = require('path');

const dirname = path.resolve(__dirname);

const fsExtra = require('fs-extra');

const fs = require('fs')

process.env.basepath = app.getAppPath();

const os = require('os');

const basepath1 = app.getAppPath();

const directoryPath = basepath1.substring(0,basepath1.lastIndexOf(':')+1);

console.log("directory path is "+ directoryPath);

const tempFolderDB =  directoryPath + "/tempDB";

const tempSSPDPPath =  directoryPath + "/tempDB/SSPDF";


// delete the temp DB 

const ipc = electron.ipcMain

const ipcMain = electron.ipcMain

const { autoUpdater } = require('electron-updater');

var parentDir = "resources";

if (fs.existsSync(parentDir)){

var dirSSPDF = 'resources/SSPDF';

var dirTemp = 'resources/temp';

if (!fs.existsSync(dirSSPDF)){

        fs.mkdirSync(dirSSPDF,'0777');

    } else{

        console.log("SSPDF Directory already exist");
    }

    if (!fs.existsSync(dirTemp)){
        fs.mkdirSync(dirTemp,'0777');
    }else
    {
        console.log("temp Directory already exist");
    }
  }

  if (fs.existsSync(parentDir)){

    var sourcePath = parentDir + "/ssDB";

    var resourceSSPDF = "resources/SSPDF";

  } else {

    var sourcePath = "ssDB";

    var resourceSSPDF = "SSPDF";
  }

  const destinationFile = tempFolderDB + "/ssDB";

  if (fs.existsSync(destinationFile)){

    copyFile(destinationFile,sourcePath);

    copyPdfFile(tempSSPDPPath,resourceSSPDF,true)

    //fsExtra.removeSync(tempSSPDPPath);


    //fs.rmdir(sourcePath);

    //fs.rmdirSync(tempFolderDB);

  }


const platforms = {
  WINDOWS: 'WINDOWS',
  MAC: 'MAC'
};

const platformsNames = {
  win32: platforms.WINDOWS,
  darwin: platforms.MAC
};

process.env.os = platformsNames[os.platform()]

global.dirname = dirname;

process.env.GOOGLE_API_KEY = 'AIzaSyBKH0bC1uSJZJW3WHXa3QRB5_GHcqfG5x4';

var BrowserWindow = electron.BrowserWindow;

let mainWindow;

function sendStatusToWindow(text) {
  //log.info(text);
  mainWindow.webContents.send('message', text);
}

app.on('window-all-closed', function () {
  app.quit();
});

// FOR PRODUCTION MAC OS
if (app.dock !== undefined && app.dock.hide() !== undefined) {
  app.dock.hide()
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function () {

    autoUpdater.setFeedURL({ provider: 'github', owner: 'MapleGraph', repo: 'ssdesktop-release', token: '97e5e84bc839b15c36f53ef4f610176acf548d7e' })
  autoUpdater.checkForUpdates();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: __dirname + '/ssicon.ico',
    webPreferences: {
      nodeIntegration: true,
      devTools: false
    }
  })

  // FOR PRODUCTION Linux | Windows
  // mainWindow.removeMenu()
  // mainWindow.setMenuBarVisibility(false)

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/signup.html');

  // ONLY FOR DEVELOPMENT.
   mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  ipc.on('print', function (event,docObj) {  

     var temPath = __dirname;

   if (temPath.indexOf('app.asar') > -1 || os === 'WINDOWS') {
    temPath = temPath.replace('app.asar', '')
  }

    const pdfPath = path.join(temPath, '/'+docObj.locationFolder+'/' + docObj.name)
    console.log("pdf path is = "+ pdfPath);
    var session = electron.session
    var k =true;
    session.defaultSession.on('will-download', (event, item, webContents) => {
      // console.log(event, item)
      console.log(k,'k')
      if(k){
        // console.log(event, item)
        event.preventDefault()
        require('request')(item.getURL(), (data) => {
          var pdfBuffer = decodeBase64Image(docObj.docStr);
          // console.log(pdfBuffer)
          var buf = Buffer.from(pdfBuffer, 'base64'); // Your code to handle binary data 
          fs.writeFile(pdfPath, buf, error => {
            if (error) { throw error; } else { console.log('binary saved!'); 
            }
          });
          // require('fs').writeFileSync(pdfPath, pdfBuffer)
        })
      }
        k = false;
    })
  })
});

ipcMain.on('app_version', (event) => {
  console.log("function app_version calling in main js");
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  console.log("function update_available calling in main js");
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + Math.floor(progressObj.percent) + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', () => {

  console.log("function update-downloaded calling in main js");

  // retain the existing database 

  fs.mkdir(tempFolderDB, "0777" ,function() {
     fs.statSync(tempFolderDB).isDirectory();
 });

  //  create a SSPDF in directory

  fs.mkdir(tempSSPDPPath, "0777" ,function() {
     fs.statSync(tempSSPDPPath).isDirectory();
 });

  copyFile(sourcePath,destinationFile);

  mainWindow.webContents.send('update_downloaded');

  copyPdfFile(resourceSSPDF,tempSSPDPPath,false)

});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
})

process.dlopen = () => {
  throw new Error('Load native module is not safe')
}


function decodeBase64Image(dataString) {
  //console.log(dataString)
  let data = dataString.replace('data:application/pdf;filename=generated.pdf;base64,','')
  // data = Buffer.from(data, 'base64');
  return data; 
}

function retainDB(){
   var object = new ActiveXObject("Scripting.FileSystemObject");
   var file = object.GetFile("C:\\wamp\\www\\phptest.php");
   file.Move("C:\\wamp\\");
   document.write("File is moved successfully");
} 


async function copyFile(source, target) {
  var rd = fs.createReadStream(source);
  var wr = fs.createWriteStream(target);
  try {
    return await new Promise(function(resolve, reject) {
      rd.on('error', reject);
      wr.on('error', reject);
      wr.on('finish', resolve);
      rd.pipe(wr);
    });
  } catch (error) {
    rd.destroy();
    wr.end();
    throw error;
  }
}

function copyPdfFile(sourceTepmPath , destinationTempPath, remove){

  fsExtra.copy(sourceTepmPath, destinationTempPath, function (err) {
  if (err) {
    console.error(err);
  } else {

        if(remove){
            fsExtra.removeSync(tempFolderDB);
        }

    console.log("success!");
  }
});

}

