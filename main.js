const { BrowserWindow, app, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

require("electron-reloader")(module);

let win;
let currentFile;

const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'renderer.js'),
            nodeIntegration: true
        }
    });

    win.webContents.setZoomFactor(10);

    win.webContents.on('before-input-event', (event, input) => {
        if (input.control && (input.key === '+' || input.key === '=')) {
            win.webContents.setZoomFactor(win.webContents.getZoomFactor() + 0.1);
            event.preventDefault();
        }
        if (input.control && input.key === '-') {
            win.webContents.setZoomFactor(win.webContents.getZoomFactor() - 0.1);
            event.preventDefault();
        }
    });

    Menu.setApplicationMenu(null);

    win.loadFile('index.html');
};

app.whenReady().then(createWindow);

ipcMain.on("open-document-triggered", () => {

    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] }
        ]
    }).then(({ canceled, filePaths }) => {
        if (!canceled) {
            const filePath = filePaths[0];
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    currentFile = filePath;
                    win.webContents.send("document-opened", { filePath, data });
                }
            });
        }
    });
});



ipcMain.on("create-document-triggered", () => {
    dialog.showSaveDialog(win, {
        filters: [
            { name: 'Text Files', extensions: ['txt'] }
        ]
    }).then(({ canceled, filePath }) => {
        if (!canceled) {
            fs.writeFile(filePath, "", (err) => {
                if (err) {
                    console.log(err);
                } else {
                    currentFile = filePath;
                    win.webContents.send("document-created", filePath);
                }
            });
        } 
    });
});

ipcMain.on("file-changed", (_, data) => {
    fs.writeFile(currentFile, data, (err) => {
        if (err) {
            console.log(err);
        }
    });
});