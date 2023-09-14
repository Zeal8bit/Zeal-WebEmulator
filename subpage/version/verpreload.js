const {ipcRenderer} = require('electron');

ipcRenderer.on('version', (event, output) => {
    // get the div element by id
    const versionDiv = document.getElementById('version');

    // set the div content to the output
    versionDiv.textContent = output;
});