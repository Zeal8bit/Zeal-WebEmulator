/**
 * SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is a part of electron version, it will init main window and chrome
const opn = require('opn');
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

function create_mainWindow() {
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
    return mainWindow;
}

var menuBar = [
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
                async click() {
                    opn('https://github.com/Zeal8bit/Zeal-WebEmulator');
                }
            },
            {
                label: 'Version',
                click() {
                    console.error("Version window is developing");
                }
            }
        ]
    },
];

const createWindow = () => {

    mainWindow = create_mainWindow();
    // Set up the menu bar
    const menu = Menu.buildFromTemplate(menuBar);
    // Set up the top menu
    Menu.setApplicationMenu(menu);
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
