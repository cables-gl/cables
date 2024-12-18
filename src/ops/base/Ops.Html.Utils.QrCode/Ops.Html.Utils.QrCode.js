const
    text = op.inString("Text", "https://cables.gl"),
    outDataUrl = op.outString("Image DataUrl"),
    outElement = op.outObject("Element", null, "element");

const cgl = op.patch.cgl;
const parentEle = document.createElement("div");
parentEle.id = "qrcode_" + CABLES.generateUUID();
parentEle.style.display = "none";
const body = document.getElementsByTagName("body")[0];
body.appendChild(parentEle);

const img = document.createElement("img");

text.onChange = generate;

let qrCanvas = null;
generate();

function generate()
{
    while (parentEle.hasChildNodes())
    {
        parentEle.removeChild(parentEle.lastChild);
    }
    const q = new QRCode(parentEle, {
        "text": text.get(),
        "width": 256,
        "height": 256,
        "colorDark": "#000000",
        "colorLight": "#ffffff",
        "correctLevel": QRCode.CorrectLevel.H
    });

    qrCanvas = document.querySelector("#" + parentEle.id + " canvas");
    qrCanvas.style.display = "block";

    outElement.set(null);
    outElement.set(img);

    const dataurl = qrCanvas.toDataURL("image/png");
    img.src = dataurl;
    outDataUrl.set(dataurl);
}
