const
    cgl = op.patch.cgl,
    inCanvas = op.inObject("canvas"),
    inTextureFilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"], "linear"),
    inTextureWrap = op.inValueSelect("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    inTextureFlip = op.inValueBool("flip"),
    inUnpackAlpha = op.inValueBool("unpackPreMultipliedAlpha"),

    inForce = op.inTriggerButton("Force Update"),

    outTexture = op.outTexture("texture"),
    outWidth = op.outNumber("width"),
    outHeight = op.outNumber("height");

const canvasTexture = new CGL.Texture(cgl);

let cgl_filter = CGL.Texture.FILTER_LINEAR;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;

inTextureFlip.set(false);
inUnpackAlpha.set(false);

inTextureFlip.setUiAttribs({ "hidePort": true });
inUnpackAlpha.setUiAttribs({ "hidePort": true });

inTextureFilter.onChange =
inTextureWrap.onChange = onFilterChange;

inForce.onTriggered =
inTextureFlip.onChange =
inCanvas.onChange =
inUnpackAlpha.onChange = reload;

function reload()
{
    let canvas = inCanvas.get();
    if (!canvas) return;

    canvasTexture.unpackAlpha = inUnpackAlpha.get();
    canvasTexture.flip = inTextureFlip.get();
    canvasTexture.wrap = cgl_wrap;
    canvasTexture.image = canvas;
    canvasTexture.initTexture(canvas, cgl_filter);

    outWidth.set(canvasTexture.width);
    outHeight.set(canvasTexture.height);

    outTexture.set(CGL.Texture.getEmptyTexture(cgl));
    outTexture.set(canvasTexture);
}

function onFilterChange()
{
    switch (inTextureFilter.get())
    {
    case "nearest": cgl_filter = CGL.Texture.FILTER_NEAREST; break;
    case "mipmap": cgl_filter = CGL.Texture.FILTER_MIPMAP; break;
    case "linear":
    default: cgl_filter = CGL.Texture.FILTER_LINEAR;
    }

    switch (inTextureWrap.get())
    {
    case "repeat": cgl_wrap = CGL.Texture.WRAP_REPEAT; break;
    case "mirrored repeat": cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT; break;
    case "clamp to edge":
    default: cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    }
    reload();
}

outTexture.set(CGL.Texture.getEmptyTexture(cgl));
