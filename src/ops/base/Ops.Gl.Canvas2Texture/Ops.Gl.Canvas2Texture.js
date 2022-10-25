const
    cgl = op.patch.cgl,
    inCanvas = op.inObject("canvas"),
    inTextureFilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"]),
    inTextureWrap = op.inValueSelect("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    inTextureFlip = op.inValueBool("flip"),
    inUnpackAlpha = op.inValueBool("unpackPreMultipliedAlpha"),
    outTexture = op.outTexture("texture"),
    outWidth = op.outNumber("width"),
    outHeight = op.outNumber("height"),
    canvasTexture = new CGL.Texture(cgl);

let cgl_filter = null;
let cgl_wrap = null;

inTextureFlip.set(false);
inUnpackAlpha.set(false);

inTextureFlip.setUiAttribs({ "hidePort": true });
inUnpackAlpha.setUiAttribs({ "hidePort": true });

inTextureFilter.onChange = onFilterChange;
inTextureWrap.onChange = onWrapChange;

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
    reload();
}

function onWrapChange()
{
    switch (inTextureWrap.get())
    {
    case "repeat": cgl_wrap = CGL.Texture.WRAP_REPEAT; break;
    case "mirrored repeat": cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT; break;
    case "clamp to edge":
    default: cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    }
    reload();
}

inTextureFilter.set("linear");
inTextureWrap.set("repeat");

outTexture.set(CGL.Texture.getEmptyTexture(cgl));
