/**
 * SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is a part of electron version, it will init main window and chrome
// const yargs = require("yargs/yargs")
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require("electron");
const yargs = require("yargs");
const path = require("node:path");
const opn = require("opn");
const menuBar = require("./menubar.js");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

app.on("will-finish-launching", initalizeCli);

app.on("ready", initalizeGui);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function initalizeGui() {
    createWindow();
}

function createWindow() {
    mainWindow = create_mainWindow();
    // Set up the menu bar
    const menu = Menu.buildFromTemplate(menuBar);
    // Set up the top menu
    Menu.setApplicationMenu(menu);
};

function create_mainWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    return mainWindow;
}

async function initalizeCli() {
    console.log(await JSON.stringify(
        await parseArgs()
            .catch((err) => {
                console.error(err);
            })
    ));
}

async function parseArgs() {
    /**
     * Manage the pre-built ROMs list. Available ROMs will be fetched from a remote JSON file that contains
     * names and links to all of the available ROMs, the first one will always be the default.
     */
    const prebuilt_json_url = "https://zeal8bit.com/roms/index.json";
    let indexjson = fetch(prebuilt_json_url)
        .then(response => response.json())
        .catch(() => {
            console.error("2Error occuceded while proccessing the index");
        });
    console.log(indexjson);
    // Parse the parameters
    var argv = yargs
        // Usage
        .usage("Usage: $0 [<options>]")
        .example("$0 -b zepto.bin", "Start the emulator and execute zepto.bin in the emulator")
        // -p
        .alias("p", "prebuild")
        .nargs("p", 1)
        .choices('i', ['peanut-butter', 'jelly', 'banana', 'pickles'])
        .descriibe("p", "Select a prebuild romdisk")
        // -b
        .alias("b", "binary")
        .nargs("b", 1)
        .describe("b", "Load a binary into zos")
        // -p
        .alias("p", "breakpoint")
        .nargs("p", 1)
        .array("-p")
        .describe("p", "Set a breakpoint")
        // -r
        .alias("r", "rom")
        .nargs("r", 1)
        .describe("r", "Load a file into rom")
        // -m
        .alias("m", "map")
        .nargs("m", 1)
        .describe("m", "Load a map file")
        // -e
        .alias("e", "eeprom")
        .nargs("e", 1)
        .describe("e", "Load a file into eeprom")
        // -h
        .help("h")
        .alias("h", "help")
        // Parse
        .parse();
    return argv;
}
