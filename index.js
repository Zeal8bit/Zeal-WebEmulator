/**
 * SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is a part of electron version, it will init main window and chrome
// const yargs = require("yargs/yargs")
const yargs = require("yargs/yargs");
const { hideBin } = require('yargs/helpers')
const opn = require('opn');
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron');
const path = require('node:path');
const fs = require("node:fs");
const menuBar = require("./menubar.js");

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

function createWindow() {
    var mainWindow = create_mainWindow();
    // Set up the menu bar
    const menu = Menu.buildFromTemplate(menuBar);
    // Set up the top menu
    Menu.setApplicationMenu(menu);
};

app.on('ready', () => {
    let argv = getArgs();
    console.log('argv', argv);
    if(!argv) {
        app.quit();
        return;
    }
    createWindow();
    parseArgs();
});

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

function getArgs() {
    // Get the parameters
    let failed = false;
    var argv = yargs(hideBin(process.argv))
        .help("h").alias("h", "help")
        .usage("Usage: $0 [<options>]")
        .example("$0 -b zepto.bin", "Start the emulator and execute zepto.bin in the emulator")
        .option('rom', {
            type: 'string',
            alias: 'r',
            // choices: ['peanut-butter', 'jelly', 'banana', 'pickles'],
            description: 'Select a prebuild romdisk or a local image',
            nargs: 1,
        })
        .option('binary', {
            type: 'string',
            alias: 'b',
            description: 'Load a executable binary into ZOS',
            nargs: 1,
        })
        .option('breakpoint', {
            type: 'string',
            alias: 'B',
            description: 'Set a breakpoint',
            array: true,
            nargs: 1,
        })
        .option('map', {
            type: 'string',
            alias: 'm',
            description: 'Load a map file',
            nargs: 1,
        })
        .option('eeprom', {
            type: 'string',
            alias: 'e',
            description: 'Load a file into EEPROM',
            nargs: 1,
        })
        .option('cf', {
            type: 'string',
            alias: 'c',
            description: 'Load a file into CompactFlash',
            nargs: 1,
        })
        .strictOptions()
        .exitProcess(false)
        .fail((msg, err, yargs) => {
            console.log(msg);
            // if(error) throw err;
            console.log(yargs.help());
            failed = true;
        })
        .parse();
    if(failed) return false;
    return argv;
}

function parseArgs(argv) {
    let img_regex = /^v[0-9]*\.[0-9]*\.[0-9]*/;
    if (fs.existsSync(`./roms/${argv.rom}.img`)) {
        argv.rom = `./roms/${argv.rom}.img`;
        mainWindow.webContents.send('rom', false, argv.rom);
    }
    else if (img_regex.test(argv.rom)) {
        mainWindow.webContents.send('rom', true, argv.rom);
    }
    else {
        mainWindow.webContents.send('rom', false, argv.rom);
    }

    return argv;
}