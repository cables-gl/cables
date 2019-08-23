const
    arrayInPalette = op.inArray("Palette array"),
    inLinear=op.inValueBool("Smooth"),
    arrOut=op.outArray("Color Array"),
    textureOut=op.outTexture("Texture");

var cgl=op.patch.cgl;

var canvas = document.createElement('canvas');
canvas.id = "canvas_"+CABLES.generateUUID();
canvas.width=5;
canvas.height=8;
canvas.style.display = "none";

var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);
var ctx = canvas.getContext('2d');

textureOut.set(CGL.Texture.getEmptyTexture(cgl));

var arr=[];
var lastFilter=null;

var r=0;
var g=0;
var b=0;

op.init=inLinear.onChange=arrayInPalette.onChange=buildTexture;

function hexToR(h) {
    return parseInt((cutHex(h)).substring(0,2),16);
}
function hexToG(h) {
    return parseInt((cutHex(h)).substring(2,4),16);
}
function hexToB(h) {
    return parseInt((cutHex(h)).substring(4,6),16);
}
function cutHex(h) {
    return (h.charAt(0)=="#") ? h.substring(1,7):h;
}

function buildTexture()
{
    var colors =  arrayInPalette.get();
    var isHexCode;
    if(!colors)
    {
        return;
    }

    var stringTest = colors[0];
    var paletteSize=0;

    if(typeof stringTest  === 'string')
    {
        isHexCode = true;
        paletteSize = colors.length;
        canvas.width=paletteSize;
        arr.length=colors.length;
    }
    else
    {
        isHexCode = false;
        paletteSize = Math.floor(colors.length/3);
        canvas.width=paletteSize;
        arr.length=paletteSize;
    }

    for(var i=0;i<paletteSize;i++)
    {
        if(isHexCode)
        {
            r = hexToR(colors[i]);
            g = hexToG(colors[i]);
            b = hexToB(colors[i]);

            arr[i*3+0]=r/255;
            arr[i*3+1]=g/255;
            arr[i*3+2]=b/255;
        }
        else
        {
            r = Math.floor(colors[i*3+0]*255);
            g = Math.floor(colors[i*3+1]*255);
            b = Math.floor(colors[i*3+2]*255);

            arr[i*3+0]=colors[i*3+0];
            arr[i*3+1]=colors[i*3+1];
            arr[i*3+2]=colors[i*3+2];
        }

        ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
        ctx.fillRect(
            canvas.width/paletteSize*i,
            0,
            canvas.width/paletteSize,
            canvas.height
            );
    }

    var filter=CGL.Texture.FILTER_NEAREST;
    if(inLinear.get())filter=CGL.Texture.FILTER_LINEAR;

    if(lastFilter==filter && textureOut.get()) textureOut.get().initTexture(canvas,filter);
        else textureOut.set(new CGL.Texture.createFromImage( op.patch.cgl, canvas, { "filter":filter } ));

    arrOut.set(null);
    arrOut.set(arr);
    textureOut.get().unpackAlpha=false;
    lastFilter=filter;
}

arrayInPalette.onLinkChanged= function()
{
    if(!arrayInPalette.isLinked())
    {
        arrOut.set(null);
        textureOut.set(CGL.Texture.getEmptyTexture(cgl));
        lastFilter=null;
    }

}

op.onDelete=function()
{
    canvas.remove();
};

buildTexture();