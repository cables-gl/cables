// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html

const text = op.inValueString("Text", "https://cables.gl");
const textureOut = op.outTexture("texture");

const cgl = op.patch.cgl;
const fontImage = document.createElement("div");
fontImage.id = "qrcode_" + CABLES.generateUUID();
fontImage.style.display = "none";
const body = document.getElementsByTagName("body")[0];
body.appendChild(fontImage);

text.onChange = generate;

generate();

function generate()
{
    textureOut.set(null);
    while (fontImage.hasChildNodes())
    {
        fontImage.removeChild(fontImage.lastChild);
    }
    new QRCode(fontImage, {
        "text": text.get(),
        "width": 256,
        "height": 256,
        "colorDark": "#000000",
        "colorLight": "#ffffff",
        "correctLevel": QRCode.CorrectLevel.H
    });

    const qrCanvas = document.querySelector("#" + fontImage.id + " canvas");

    if (textureOut.get())
    {
        textureOut.get().initTexture(qrCanvas, CGL.Texture.FILTER_NEAREST);
    }
    else
    {
        textureOut.set(new CGL.Texture.createFromImage(
            cgl,
            qrCanvas,
            { "filter": CGL.Texture.FILTER_NEAREST }
        ));
    }
}
