const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    on: (event, callback) => ipcRenderer.on(event, (_event, data) => callback(data)),
    loaded: () => ipcRenderer.send("load", true)
});
