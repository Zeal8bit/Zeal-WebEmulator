/**
 * SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is a part of electron version, it will init main window and chrome
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

// 打开新窗口
function openDefaultBrowser(url) {
    var exec = require('child_process').exec;
    console.log(process.platform)
    switch (process.platform) {
        case "darwin":
            exec('open ' + url);
            break;
        case "win32":
            exec('start ' + url);
            break;
        default:
            exec('xdg-open', [url]);
    }
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    const menuBar = [
        {
            label: 'App',
            submenu: [
                {
                    label: 'Quit',
                    accelerator: 'ctrl+q',
                    click() {
                        app.quit();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Reload',
                    accelerator: 'ctrl+r',
                    click() {
                        mainWindow.webContents.reload();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Force Reload',
                    accelerator: 'ctrl+f',
                    click() {
                        mainWindow.webContents.reload(true);
                    }
                },
            ]
        },
        {
            label: 'Developers',
            submenu: [
                {
                    label: 'Open DevTools',
                    accelerator: 'ctrl+s',
                    click() {
                        mainWindow.webContents.openDevTools();
                    }
                }
            ]
        },
        {
            label: 'About',
            submenu: [
                {
                    label: 'Git Repository',
                    click() {
                        openDefaultBrowser("https://github.com/Zeal8bit/Zeal-WebEmulator");
                    }
                }
            ]
        },
    ];

    // 构建菜单项
    const menu = Menu.buildFromTemplate(menuBar);
    // 设置一个顶部菜单栏
    Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
