const { ipcRenderer } = require('electron');

var $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
    const counter = document.getElementById('counter');
    ipcRenderer.on('rom', (_event, prebuilt, value) => {
        if (prebuilt) {
            $("")
        }
        else {

        }
    });
});