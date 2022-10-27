const { ipcRenderer } = require('electron');
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

var uploadFile = document.getElementById('upload');

uploadFile.addEventListener('click', () => {
    ipcRenderer.send('file-request');
});

ipcRenderer.on('file', (event, file) => {
    console.log('obtained file from main process: ' + file);
    let xml_string = fs.readFileSync(file, "utf8");

    parser.parseString(xml_string, function (error, result) {
        if (error) {
            console.error(error);
        }

        const dets = result?.nfeProc?.NFe?.[0]?.infNFe?.[0]?.det;
        dets.forEach(det => {
            const produto = det?.prod?.[0]?.cProd?.[0];
            const infProd = det?.infAdProd?.[0];
            let nLote = "";
            let validade = "";
            console.log(infProd)
            if (infProd.includes(` / `)) {
                nLote = infProd.split(`/`).filter(s => s.includes(`Lote`))[0].split(`:`)[1]
                validade = infProd.split(`/`).filter(s => s.includes(`Validade`))[0].split(`:`)[1]
            } else {
                validade = infProd.split(`Val:`)[1];
                nLote = infProd.split(`Val:`)[0].trim().split(`Lote:`)[1]
            }

            createCard({ produto, validade, lote: nLote })

        })

    });

});


const temp = document.getElementsByTagName("template")[0];
const produto = temp.content.querySelector("#produto");


const cardsDiv = document.getElementById("cards");

function createCard({ produto: nome, validade, lote }) {

    const a = document.importNode(produto, true)
    const nomeProduto = a.querySelector("#nome");
    const loteProduto = a.querySelector("#lote");
    const validadeProduto = a.querySelector("#validade");

    nomeProduto.textContent += nome;
    loteProduto.textContent += lote;
    validadeProduto.textContent += validade;

    cardsDiv.appendChild(a)
}

function toHex(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16);
    }
    return result;
}