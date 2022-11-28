const { ipcRenderer } = require('electron');
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

var uploadFile = document.getElementById('upload');
const lotes = {}
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
            const quantidade = det?.prod?.[0]?.qCom?.[0];
            const infProd = det?.infAdProd?.[0];
            let nLote = "";
            let validade = "";
            if (infProd.includes(` / `)) {
                nLote = infProd.split(`/`).filter(s => s.includes(`Lote`))[0].split(`:`)[1]
                validade = infProd.split(`/`).filter(s => s.includes(`Validade`))[0].split(`:`)[1]
            } else {
                validade = infProd.split(`Val:`)[1];
                nLote = infProd.split(`Val:`)[0].trim().split(`Lote:`)[1]
            }

            createCard({ produto, validade, lote: nLote, quantidade })

        })
        console.log(lotes)
    });

});


const temp = document.getElementsByTagName("template")[0];
const produto = temp.content.querySelector("#produto");


const cardsDiv = document.getElementById("cards");

function createCard({ produto: nome, validade, lote, quantidade }) {

    const a = document.importNode(produto, true)
    const nomeProduto = a.querySelector("#nome");
    const qtdroduto = a.querySelector("#qtd");
    const loteProduto = a.querySelector("#lote");
    const validadeProduto = a.querySelector("#validade");
    const epc = a.querySelector("#epc");
    const buttonGerarTag = a.querySelector("#gerarTag");

    nomeProduto.textContent += nome;
    loteProduto.textContent += lote;
    validadeProduto.textContent += validade;
    qtdroduto.textContent += quantidade;
    
    lote = lote.split(` `).join(``).replaceAll(`(1)`, '').replaceAll(`(2)`, '');
    epc.textContent += nome + lote + validade.replaceAll("/", "").replaceAll(` `, '') + "93d57f";

    buttonGerarTag.addEventListener(`click`,() => {
        buttonGerarTag.classList.add("animating")
        const zpl = `^XA
^BY5,2,270
^FO100,550^BC^FD${nome}^FS
^FS
^RW27,27,E2
^RS,F43,,${quantidade}
^RFW,H
^FD${epc.textContent}
^FS
^XZ`

        download(zpl, `${nome}.zpl`, `zpl`)
    })

    if (lote in lotes) {
        lotes[lote].produtos.push(nome);
    } else {
        lotes[lote] = { produtos: [nome] }
    }
    cardsDiv.appendChild(a)
}


// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}