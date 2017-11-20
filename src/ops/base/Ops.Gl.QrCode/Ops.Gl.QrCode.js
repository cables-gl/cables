var text=op.inValueString("Text","https://cables.gl");
var textureOut=op.outTexture("texture");

var cgl=op.patch.cgl;
var fontImage = document.createElement('canvas');
fontImage.id = "qrcode_"+CABLES.generateUUID();
fontImage.style.display = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(fontImage);

text.onChange=generate;

generate();

function generate()
{
    textureOut.set(null);
    var qr = new QRious({
        element: fontImage,
        level: 'H',
        padding: 10,
        size: 256,
        value: text.get()
    });

    if(textureOut.get()) textureOut.get().initTexture(fontImage,CGL.Texture.FILTER_NEAREST);
        else textureOut.set(new CGL.Texture.createFromImage( cgl, fontImage, { filter:CGL.Texture.FILTER_NEAREST } ));
}


