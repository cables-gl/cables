const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;



var config=
{
  fullscreen:false,
  frame: false,
  stretchOverScreens:true
};

var winConfig={
      width: 1280,
      height: 720,
      fullscreen: config.fullscreen,
      frame: config.frame,
      enableLargerThanScreen:true
    };



function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow(winConfig);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

app.on('ready', function()
{
    if(config.stretchOverScreens)
    {
        var displays = electron.screen.getAllDisplays();
        console.log(displays);
        var widthAll=0;
        var minHeight=99999;
        var minPos=999999;
        var minPosY=0;
        for(var i=0;i<displays.length;i++)
        {
            widthAll+=displays[i].workAreaSize.width;
            minHeight=Math.min(minHeight,displays[i].workAreaSize.height);
            minPos=Math.min(minPos,displays[i].workArea.x);
            minPosY=Math.max(minPosY,displays[i].workArea.y);
        }

        console.log("Usable area:",widthAll,minHeight,minPos);
        winConfig.x=minPos;
        winConfig.y=minPosY;
        winConfig.width=widthAll;
        winConfig.height=minHeight;
    }

    createWindow();



//   let externalDisplay = displays.find((display) => {
//     return display.bounds.x !== 0 || display.bounds.y !== 0
//   })

//   if (externalDisplay) {
//     win = new BrowserWindow({
//       x: externalDisplay.bounds.x + 50,
//       y: externalDisplay.bounds.y + 50
//     })
//     win.loadURL('https://github.com')
//   }


});

app.on('will-quit', function()
{
  electron.globalShortcut.unregister('Escape');
  electron.globalShortcut.unregisterAll();
});





// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
