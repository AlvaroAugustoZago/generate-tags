const { ipcRenderer } = require('electron');
var uploadFile = document.getElementById('upload');

//upon clicking upload file, request the file from the main process
uploadFile.addEventListener('click', () => {
    ipcRenderer.send('file-request');
});

//upon receiving a file, process accordingly
ipcRenderer.on('file', (event, file) => {
    console.log('obtained file from main process: ' + file);
});