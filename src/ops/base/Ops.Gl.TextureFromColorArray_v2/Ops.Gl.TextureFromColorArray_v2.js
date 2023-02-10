const
    inExe = op.inTrigger("Update"),
    inArr = op.inArray("array", null, 4),
    inWidth = op.inValueInt("width", 32),
    inHeight = op.inValueInt("height", 32),
    inPixel = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "nearest"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    fillUp = op.inBool("Fill Up", true),
    outNext = op.outTrigger("Next"),
    outTex = op.outTexture("Texture out");

const cgl = op.patch.cgl;
const emptyTex = CGL.Texture.getEmptyTexture(cgl);

let tex = new CGL.Texture(cgl);
let arrayResized = true;
let pixels = new Uint8Array(8);
let cgl_filter = CGL.Texture.FILTER_NEAREST;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let needsUpdate = true;
inExe.onTriggered = update;

inArr.onChange = () =>
{
    needsUpdate = true;
};

tfilter.onChange =
    inPixel.onChange =
    wrap.onChange =
    inWidth.onChange =
    fillUp.onChange =
    inHeight.onChange = () =>
    {
        needsUpdate = true;
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

function update()
{
    if (!needsUpdate) return;
    let error = false;
    let w = inWidth.get();
    let h = inHeight.get();
    let data = inArr.get();
    const isFp = inPixel.get() == CGL.Texture.PFORMATSTR_RGBA32F;

    if (w <= 0 || h <= 0 || !data) error = true;

    if (error)
    {
        outTex.set(emptyTex);
        return;
    }

    if (arrayResized)
    {
        if (isFp) pixels = new Float32Array(w * h * 4);
        else pixels = new Uint8Array(w * h * 4);

        arrayResized = false;
    }

    if (isFp)
    {
        for (let i = 0; i < data.length; i++) pixels[i] = data[i];

        if (fillUp.get())
        {
            for (let i = data.length; i < w * h * 4; i += 4)
            {
                const idx = i;
                const rndIdx = i % data.length;

                pixels[idx + 0] = data[rndIdx + 0];
                pixels[idx + 1] = data[rndIdx + 1];
                pixels[idx + 2] = data[rndIdx + 2];
                pixels[idx + 3] = data[rndIdx + 3];
            }
        }
        else for (let i = data.length; i < w * h * 4; i++) pixels[i] = 0;
    }
    else
    {
        for (let i = 0; i < data.length; i++) pixels[i] = data[i] * 255;
        for (let i = data.length; i < w * h * 4; i++) pixels[i] = 0;
    }

    if (!tex)tex = new CGL.Texture(cgl, { "isFloatingPointTexture": isFp, "name": "array2texture" });

    tex.initFromData(pixels, w, h, cgl_filter, cgl_wrap);

    outTex.setRef(tex);

    outNext.trigger();
    needsUpdate = false;
}
