const { ipcRenderer } = require('electron');
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

var uploadFile = document.getElementById('upload');

//upon clicking upload file, request the file from the main process
uploadFile.addEventListener('click', () => {
    ipcRenderer.send('file-request');
});

//upon receiving a file, process accordingly
ipcRenderer.on('file', (event, file) => {
    console.log('obtained file from main process: ' + file);
    let xml_string = fs.readFileSync(file, "utf8");

    parser.parseString(xml_string, function (error, result) {
        if (error) {
            console.error(error);
        }
        
        
    });

});