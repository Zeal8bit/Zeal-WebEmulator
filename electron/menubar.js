const { app } = require('electron');

module.exports = [
    {
        label: 'App',
        submenu: [
            {
                label: 'Quit',
                accelerator: 'CommandOrControl+q',
                click() {
                    app.quit();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Reload',
                accelerator: 'CommandOrControl+r',
                click() {
                    mainWindow.webContents.reload();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Force Reload',
                accelerator: 'CommandOrControl+f',
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
                accelerator: 'CommandOrControl+s',
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