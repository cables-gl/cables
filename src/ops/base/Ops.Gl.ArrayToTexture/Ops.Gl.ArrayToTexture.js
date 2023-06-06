const
    inExe = op.inTrigger("Update"),
    inArr = op.inArray("array"),
    inWidth = op.inValueInt("width", 32),
    inHeight = op.inValueInt("height", 32),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "nearest"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    outNext = op.outTrigger("Next"),
    outTex = op.outTexture("Texture out");

inExe.onTriggered = update;

const cgl = op.patch.cgl;
let tex = new CGL.Texture(cgl);

let arrayResized = true;
let pixels = new Uint8Array(8);

let cgl_filter = CGL.Texture.FILTER_NEAREST;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;

op.toWorkPortsNeedToBeLinked(inExe, inArr);

tfilter.onChange =
    wrap.onChange =
    inWidth.onChange =
    inHeight.onChange = function ()
    {
        if (tex)tex.delete();
        tex = null;
        arrayResized = true;

        if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
        else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
        else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
        else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;

        if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
        else if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
        else if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    };

const emptyTex = CGL.Texture.getEmptyTexture(cgl);

function update()
{
    let error = false;
    let w = inWidth.get();
    let h = inHeight.get();
    let data = inArr.get();

    if (w <= 0 || h <= 0 || !data) error = true;

    if (error)
    {
        outTex.set(emptyTex);
        return;
    }

    if (arrayResized)
    {
        pixels = new Uint8Array(w * h * 4);
        arrayResized = false;
    }
    let i = 0;

    for (i = 0; i < data.length; i++)
    {
        pixels[i] = data[i] * 255;
    }
    for (i = data.length; i < w * h * 4; i++)
    {
        pixels[i] = 255;
    }

    if (!tex)tex = new CGL.Texture(cgl);

    tex.initFromData(pixels, w, h, cgl_filter, cgl_wrap);

    outTex.set(tex);

    outNext.trigger();
}
