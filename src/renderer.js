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

            // console.log(nLote)
            // console.log(toHex(tag)) 
            createCard({ produto, validade, lote: nLote })

        })

    });

});

let totalItens = 0
function createCard({ produto, validade, lote }) {
    const cardsDiv = document.getElementById("cards");
    totalItens++;
    if (totalItens>1) {
        // cardsDiv.innerHTML += '<br>';
        totalItens=0
    }
    cardsDiv.innerHTML += `
    <section class="item">
        <aside>
          <p>Produto</p>
          <h5>${produto}</h5>
          <p>Lote</p>
          <h5>${lote}</h5>
          <p>Validade</p>
          <h5>${validade}</h5>
        </aside>
        </section>
    `
}

function toHex(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16);
    }
    return result;
}