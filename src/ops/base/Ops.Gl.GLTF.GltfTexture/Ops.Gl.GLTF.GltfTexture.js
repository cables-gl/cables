const
    inExec = op.inTrigger("Render"),
    imgName = op.inString("Name", ""),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "mipmap"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], 0),
    flip = op.inValueBool("Flip", false),
    unpackAlpha = op.inValueBool("Pre Multiplied Alpha", false),
    outTex = op.outTexture("Texture"),
    width = op.outNumber("Width"),
    height = op.outNumber("Height"),
    type = op.outString("Type"),
    outFound = op.outBool("Found");

const cgl = op.patch.cgl;
let tex = null;
let cgl_filter = 0;
let cgl_wrap = 0;
let cgl_aniso = 0;

aniso.onChange = tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;
imgName.onChange = flip.onChange = unpackAlpha.onChange = function () { reloadSoon(); };

function reloadSoon()
{
    tex = null;
}

inExec.onTriggered = function ()
{
    if (tex) return;

    if (!cgl.frameStore.currentScene || !cgl.frameStore.currentScene.json) return;

    if (cgl.frameStore.currentScene.chunks.length < 2)
    {
        return;
    }

    if (!cgl.frameStore.currentScene.json.images) return;

    let img = null;

    for (let i = 0; i < cgl.frameStore.currentScene.json.images.length; i++)
    {
        if (cgl.frameStore.currentScene.json.images[i].name == imgName.get() || cgl.frameStore.currentScene.json.images[i].bufferView == parseFloat(imgName.get()))
        {
            img = cgl.frameStore.currentScene.json.images[i];
        }
    }
    if (!img)
    {
        tex = CGL.Texture.getEmptyTexture(cgl);
        outFound.set(false);
        outTex.set(tex);
        width.set(tex.width);
        height.set(tex.height);
        return;
    }

    const buffView = cgl.frameStore.currentScene.json.bufferViews[img.bufferView];
    let dv = cgl.frameStore.currentScene.chunks[1].dataView;

    if (!buffView) return;
    const data = new Uint8Array(buffView.byteLength);

    for (let i = 0; i < buffView.byteLength; i++)
        data[i] = dv.getUint8(buffView.byteOffset + i);

    const blob = new Blob([data.buffer], { "type": img.mimeType });
    const sourceURI = URL.createObjectURL(blob);

    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
    else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;

    cgl_aniso = parseFloat(aniso.get());

    tex = CGL.Texture.load(cgl, sourceURI,
        function (err)
        {
            if (err)
            {
                outFound.set(false);
            }

            outTex.set(tex);

            width.set(tex.width);
            height.set(tex.height);
            type.set(img.mimeType);
            outTex.set(null);
            outTex.set(tex);
            outFound.set(true);
        }, {
            "anisotropic": cgl_aniso,
            "wrap": cgl_wrap,
            "flip": flip.get(),
            "unpackAlpha": unpackAlpha.get(),
            "filter": cgl_filter
        });

    outTex.set(null);
    outTex.set(tex);
};

function onFilterChange()
{
    reloadSoon();
}

function onWrapChange()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reloadSoon();
}
