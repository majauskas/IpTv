"use strict";
process.on('uncaughtException', function(err) {
	  console.error((err && err.stack) ? err.stack : err);
});

const Server = require(__dirname + "/server.js");

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {

  var isProd = true;
  if(process.argv[2] == "prod"){
	  isProd = true;
  }
//  isProd = false;
  if(isProd){
	  mainWindow = new BrowserWindow({show: false, fullscreen:true,autoHideMenuBar:true, darkTheme: true, disableAutoHideCursor:true, webPreferences: {nodeIntegration: false}})
  }else{
	  mainWindow = new BrowserWindow({show: false, width: 1400, height: 900, x: 0, y: 0, fullscreen:false,autoHideMenuBar:true, darkTheme: true, webPreferences: {nodeIntegration: false}})      
  }
  
//  mainWindow = new BrowserWindow({width: 800, height: 700, x: 0, y: 0, fullscreen:false,autoHideMenuBar:true, darkTheme: true, webPreferences: {nodeIntegration: false}})

  mainWindow.loadURL("http://localhost:8080");
  
  // Open the DevTools.
  if(!isProd){
    mainWindow.webContents.openDevTools()
  }
  

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });
  
  mainWindow.webContents.on('did-finish-load', function() {
	    setTimeout(function(){
	      mainWindow.show();
	    }, 40);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// Start the core application.
// This starts all node helpers and starts the webserver.

Server.start();

