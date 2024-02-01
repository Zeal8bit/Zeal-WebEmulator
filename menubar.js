module.exports = [
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