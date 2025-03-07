const
    inExe = op.inTrigger("Update"),
    inArr = op.inArray("array", null),
    inStride = op.inSwitch("Source Structure", ["MONO", "RGB", "RGBA"], "RGBA"),
    inSizeType = op.inSwitch("Size", ["Manual", "Square", "Row", "Column"], "Manual"),
    inWidth = op.inValueInt("width", 32),
    inHeight = op.inValueInt("height", 32),
    fillUp = op.inBool("Fill Up", false),
    flip = op.inBool("Flip", false),
    inPixel = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA32F),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "nearest"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    outNext = op.outTrigger("Next"),
    outTex = op.outTexture("Texture out"),
    outWidth = op.outNumber("Tex Width"),
    outHeight = op.outNumber("Tex Height");

const cgl = op.patch.cgl;
const emptyTex = CGL.Texture.getEmptyTexture(cgl);

let tex = null;
let arrayResized = true;
let pixels = new Uint8Array(8);
let cgl_filter = CGL.Texture.FILTER_NEAREST;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let needsUpdate = true;
inExe.onTriggered = update;

flip.onChange =
    inStride.onChange =
    inSizeType.onChange =
    inArr.onChange =
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
    if (!needsUpdate) return outNext.trigger();

    // fillUp.setUiAttribs({greyout:inSizeType.get()!="Manual"});
    inWidth.setUiAttribs({ "greyout": inSizeType.get() != "Manual" });
    inHeight.setUiAttribs({ "greyout": inSizeType.get() != "Manual" });

    let error = false;
    let w = inWidth.get();
    let h = inHeight.get();
    let stride = 3;
    if (inStride.get() == "RGBA")stride = 4;
    if (inStride.get() == "MONO")stride = 1;

    inArr.setUiAttribs({ "stride": stride });

    let data = inArr.get();
    const isFp = inPixel.get().indexOf("float") > -1;

    if (w <= 0 || h <= 0 || !data) error = true;

    if (error)
    {
        outTex.setRef(emptyTex);
        return;
    }

    if (inSizeType.get() == "Square")
    {
        w = h = Math.ceil(Math.sqrt(data.length / stride));
    }
    else if (inSizeType.get() == "Row")
    {
        w = data.length / stride;
        h = 1;
    }
    else if (inSizeType.get() == "Column")
    {
        h = data.length / stride;
        w = 1;
    }

    if (arrayResized)
    {
        if (isFp) pixels = new Float32Array(w * h * 4);
        else pixels = new Uint8Array(w * h * 4);

        arrayResized = false;
    }

    let num = data.length / stride;
    if (fillUp.get())num = w * h;

    for (let i = 0; i < num; i++)
    {
        for (let j = 0; j < stride; j++)
        {
            let v = data[(i * stride + j) % data.length];
            if (!isFp)v *= 255;

            pixels[i * 4 + j] = v;
        }
        if (stride == 1)
        {
            const v = pixels[i * 4 + 0];
            pixels[i * 4 + 1] = v;
            pixels[i * 4 + 2] = v;
            if (isFp) pixels[i * 4 + 3] = 1;
            else pixels[i * 4 + 3] = 255;
        }

        if (stride == 3)
            if (isFp) pixels[i * 4 + 3] = 1.0;
            else pixels[i * 4 + 3] = 255;
    }

    if (!tex) tex = new CGL.Texture(cgl, { "pixelFormat": inPixel.get(), "name": "array2texture" });

    if (flip.get())
    {
        const flipped = new Float32Array(pixels.length);

        for (let i = 0; i < pixels.length; i += 4)
        {
            flipped[pixels.length - i - 4] = pixels[i];
            flipped[pixels.length - i - 3] = pixels[i + 1];
            flipped[pixels.length - i - 2] = pixels[i + 2];
            flipped[pixels.length - i - 1] = pixels[i + 3];
        }

        pixels = flipped;
    }

    tex.initFromData(pixels, w, h, cgl_filter, cgl_wrap);

    outWidth.set(w);
    outHeight.set(h);

    outTex.setRef(tex);

    outNext.trigger();
    needsUpdate = false;
}
