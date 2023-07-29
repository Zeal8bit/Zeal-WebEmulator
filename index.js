/**
 * SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is a part of electron version, it will init main window and chrome
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

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

function create_versionWindow() {
    var versionWindow = new BrowserWindow({
        width: 400,
        height: 175,
        show: false, // hide the window initially
        webPreferences: {
            nodeIntegration: true, // enable node modules in renderer
            preload: path.join(__dirname, 'verpreload.js'),
        }
    });

    // load the html file for the window
    versionWindow.loadFile('version.html');
    versionWindow.setMenuBarVisibility(false);
    return versionWindow;
}

function getGitBranch() {
    // 获取当前分支名
    let head = fs.readFileSync('.git/HEAD', 'utf-8').trim();
    let branch = head.slice(5).split('/').pop();
    // 获取当前hash
    let hash = fs.readFileSync(`.git/refs/heads/${branch}`, 'utf-8').trim();
    // 获取最近的tag名和距离
    let tags = fs.readdirSync('.git/refs/tags');
    let tag, distance;
    for (let i = tags.length - 1; i >= 0; i--) {
        let tagHash = fs.readFileSync(`.git/refs/tags/${tags[i]}`, 'utf-8').trim();
        let result = execa.sync('git', ['rev-list', '--count', `${tagHash}..${hash}`]);
        if (result.exitCode === 0) {
            tag = tags[i];
            distance = result.stdout;
            break;
        }
    }
    // 拼接git describe --all --long信息
    let describe = `tags/${tag}-${distance}-g${hash.slice(0, 7)}`;
    return describe;
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
                click() {
                    openDefaultBrowser("https://github.com/Zeal8bit/Zeal-WebEmulator");
                }
            },
            {
                label: 'Version',
                click() {
                    if (!versionWindow) { // 检查窗口对象是否存在
                        versionWindow = create_versionWindow();
                    }
                    versionWindow.show();

                    let describe = getGitBranch();
                    // send the version information to the window using ipcMain
                    versionWindow.webContents.send('version', describe);

                    versionWindow.on('closed', () => {
                        versionWindow = null; // 设置窗口对象为null
                    });
                }
            }
        ]
    },
];

const createWindow = () => {

    mainWindow = create_mainWindow();
    versionWindow = create_versionWindow();

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
