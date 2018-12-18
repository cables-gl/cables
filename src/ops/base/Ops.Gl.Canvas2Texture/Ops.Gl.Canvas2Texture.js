/**
 * canvas2texture op for cables
 * @author Jan <LJ> Scheurer - Xe-Development UG
 */
const
    cgl = op.patch.cgl,
    inCanvas = op.inObject("canvas"),
    inTextureFilter = op.inValueSelect("filter",['nearest','linear','mipmap']),
    inTextureWrap = op.inValueSelect("wrap",['repeat','mirrored repeat','clamp to edge'],"clamp to edge"),
    inTextureFlip = op.inValueBool("flip"),
    inUnpackAlpha = op.inValueBool("unpackPreMultipliedAlpha"),

    outTexture = op.outTexture("texture"),
    outWidth = op.outValue("width"),
    outHeight = op.outValue("height"),
    canvasTexture = new CGL.Texture(cgl)
;

var cgl_filter = null;
var cgl_wrap = null;

inTextureFlip.set(false);
inTextureFlip.hidePort();
inUnpackAlpha.set(false);
inUnpackAlpha.hidePort();

inTextureFilter.onChange = onFilterChange;
inTextureWrap.onChange = onWrapChange;

inTextureFlip.onChange =
inCanvas.onChange =
inUnpackAlpha.onChange = reload;

function reload () {
    var canvas = inCanvas.get();
    if (!canvas) return;

    canvasTexture.unpackAlpha = inUnpackAlpha.get();
    canvasTexture.flip = inTextureFlip.get();
    canvasTexture.wrap = cgl_wrap;
    canvasTexture.image = canvas;
    canvasTexture.initTexture(canvas, cgl_filter);
    outWidth.set(canvasTexture.width);
    outHeight.set(canvasTexture.height);

    outTexture.set(null);
    outTexture.set(canvasTexture);

    if (!canvasTexture.isPowerOfTwo()) {
        op.uiAttr({
            hint:'texture dimensions not power of two! - texture filtering will not work.',
            warning:null
        });
    } else {
        op.uiAttr({
            hint:null,
            warning:null
        });
    }
}

function onFilterChange() {
    switch (inTextureFilter.get()) {
        case "nearest": cgl_filter = CGL.Texture.FILTER_NEAREST; break;
        case "mipmap": cgl_filter = CGL.Texture.FILTER_MIPMAP; break;
        case "linear":
        default: cgl_filter = CGL.Texture.FILTER_LINEAR;
    }
    reload();
}

function onWrapChange() {
    switch (inTextureWrap.get()) {
        case "repeat": cgl_wrap = CGL.Texture.WRAP_REPEAT; break;
        case "mirrored repeat": cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT; break;
        case "clamp to edge":
        default: cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    }
    reload();
}

inTextureFilter.set('linear');
inTextureWrap.set('repeat');

outTexture.set(CGL.Texture.getEmptyTexture(cgl));

/*
//Test Code
var ctx = document.createElement('canvas').getContext('2d');
ctx.fillStyle = "#FFF";
ctx.fillRect(50,0,50,1000);
//CABLES.patch.getOpsByName("canvas2texture")[0].getPortByName('canvas').set(ctx.canvas);
*/
