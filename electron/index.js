/**
 * SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is a part of electron version, it will init main window and chrome
const yargs = require("yargs/yargs");
const { hideBin } = require('yargs/helpers')
const opn = require('opn');
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron');
const path = require('node:path');
const fs = require("node:fs");
const menuBar = require("./menubar.js");
const ElectronConfig = require('electron-config');

const config = new ElectronConfig();

if((process.env.ELECTRON_RELOAD) == '1') {
    console.log('Electron Reload enabled');
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    });
}


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

function create_mainWindow() {
    let opts = {
        show: false,
        width: 1200,
        height: 800,
    };
    Object.assign(opts, config.get("winBounds"));

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        ...opts,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.once('ready-to-show', mainWindow.show);

    mainWindow.on("close", function() {
        config.set('winBounds', mainWindow.getBounds())
        console.log('config written to', config.path);
    });

    mainWindow.loadFile(path.join(__dirname, '../index.html'));
    return mainWindow;
}

function createWindow() {
    mainWindow = create_mainWindow();
    // Set up the menu bar
    const menu = Menu.buildFromTemplate(menuBar);
    // Set up the top menu
    Menu.setApplicationMenu(menu);
};

app.on('ready', () => {
    let argv = getArgs();
    if(!argv) {
        app.quit();
        return;
    }
    createWindow();
    ipcMain.on("load", async () => {
        await parseArgs(argv);
    });
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
        .example("$0 --rom v0.4.0-9-ge68eb04 --eeprom /your/eeprom/image", "Start the emulator, use zos v0.4.0-9-ge68eb04 and load /your/eeprom/image to eeprom")
        .option('hide-advanced', {
            type: 'boolean',
            alias: 'a',
            description: 'Hide the advanced ROM menu',
            default: false,
        })
        .option('rom', {
            type: 'string',
            alias: 'r',
            description: 'Select a prebuild romdisk or a local image',
            nargs: 1,
        })
        .option('breakpoint', {
            type: 'string',
            alias: 'b',
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
    if(failed || (argv.help == true)) {
        return false;
    }

    if(argv.rom && !fs.existsSync(argv.rom)) {
        console.warn('--rom', 'invalid filename', argv.rom);
        return false;
    }

    if(argv.map && !fs.existsSync(argv.map)) {
        console.warn('--map', 'invalid filename', argv.map);
        return false;
    }

    if(argv.eeprom && !fs.existsSync(argv.eeprom)) {
        console.warn('--eeprom', 'invalid filename', argv.eeprom);
        return false;
    }

    if(argv.cf && !fs.existsSync(argv.cf)) {
        console.warn('--cf', 'invalid filename', argv.cf);
        return false;
    }

    return argv;
}

async function parseArgs(argv) {
    async function setFileInput(wc, selector, files) {
      try {
        wc.debugger.attach("1.1");

        const { root } = await wc.debugger.sendCommand("DOM.getDocument", {});
        const { nodeId } = await wc.debugger.sendCommand("DOM.querySelector", {
          nodeId: root.nodeId,
          selector,
        });

        await wc.debugger.sendCommand("DOM.setFileInputFiles", {
          nodeId,
          files,
        });
        return true;
      } catch (err) {
        return false;
      } finally {
        wc.debugger.detach();
      }
    }

    let loadAdvanced = false;

    if (argv.rom) {
        loadAdvanced |= await setFileInput(mainWindow.webContents, "#file-rom", [path.resolve(argv.rom)]);
    }
    if (argv.map) {
        loadAdvanced |= await setFileInput(mainWindow.webContents, "#file-map", [path.resolve(argv.map)]);
    }
    if (argv.eeprom) {
        loadAdvanced |= await setFileInput(mainWindow.webContents, "#file-eeprom", [path.resolve(argv.eeprom)]);
    }
    if (argv.cf) {
        loadAdvanced |= await setFileInput(mainWindow.webContents, "#file-cf", [path.resolve(argv.cf)]);
    }

    if(loadAdvanced) {
        mainWindow.webContents.send('load-advanced', { hideAdvanced: argv.hideAdvanced });
    }

    if (argv.breakpoint) {
        mainWindow.webContents.send('breakpoint', argv.breakpoint);
    }

    return argv;
}
