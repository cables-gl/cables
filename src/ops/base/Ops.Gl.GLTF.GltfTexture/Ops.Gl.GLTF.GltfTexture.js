const
    inExec = op.inTrigger("Render"),
    imgName = op.inString("Name", ""),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "mipmap"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], 0),
    flip = op.inBool("Flip", false),
    unpackAlpha = op.inBool("Pre Multiplied Alpha", false),
    outTex = op.outTexture("Texture"),
    width = op.outNumber("Width"),
    height = op.outNumber("Height"),
    type = op.outString("Type"),
    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;
let tex = null;
let cgl_filter = 0;
let cgl_wrap = 0;
let cgl_aniso = 0;

let oldScene = null;
aniso.onChange = tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;
imgName.onChange = flip.onChange = unpackAlpha.onChange = function () { reloadSoon(); };

function reloadSoon()
{
    tex = null;
}

inExec.onTriggered = function ()
{

    if (cgl.tempData.currentScene != oldScene) tex = null;
    if (tex) return console.log("has tex...");

    if (!cgl.tempData.currentScene || !cgl.tempData.currentScene.json || !cgl.tempData.currentScene.chunks) return console.log("no chunks1");

    if (cgl.tempData.currentScene.chunks.length < 2) return console.log("no chunks...");

    if (!cgl.tempData.currentScene.json.images) return console.log("has no json image");

    let img = null;
    oldScene = cgl.tempData.currentScene;

    for (let i = 0; i < cgl.tempData.currentScene.json.images.length; i++)
    {
        if (
            cgl.tempData.currentScene.json.images[i].name == imgName.get() ||
            cgl.tempData.currentScene.json.images[i].bufferView == parseFloat(imgName.get()))
        {
            img = cgl.tempData.currentScene.json.images[i];
        }
    }
    if (!img)
    {
        tex = CGL.Texture.getEmptyTexture(cgl);
        outFound.set(false);
        outTex.set(tex);
        width.set(tex.width);
        height.set(tex.height);
        console.log("no img");
        return;
    }

    const buffView = cgl.tempData.currentScene.json.bufferViews[img.bufferView];
    const chunk = cgl.tempData.currentScene.chunks[1];
    if (!buffView) return console.log("no buffview");
    if (!chunk) return console.log("no chunk");

    let dv = chunk.dataView;

    const data = new Uint8Array(buffView.byteLength);

    for (let i = 0; i < buffView.byteLength; i++)
        data[i] = dv.getUint8(buffView.byteOffset + i);

    const blob = new Blob([data.buffer], { "type": img.mimeType });
    const sourceURI = URL.createObjectURL(blob);

    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;

    cgl_aniso = parseFloat(aniso.get());

    const loadingId = cgl.patch.loading.start("gltfTextureOp", CABLES.uuid(), op);

    CGL.Texture.load(cgl, sourceURI, function (err, tex)
    {
        cgl.patch.loading.finished(loadingId);
        if (!tex)
        {
            console.log("no texxxxxxx");
            return;
        }
        if (err)
        {
            console.error("img load error", err);
        }
        else
        {
            width.set(tex.width);
            height.set(tex.height);
            type.set(img.mimeType);
            outTex.setRef(tex);
            outFound.set(true);
        }

        outTex.setRef(tex);
    },
    {
        "anisotropic": cgl_aniso,
        "wrap": cgl_wrap,
        "flip": flip.get(),
        "unpackAlpha": unpackAlpha.get(),
        "filter": cgl_filter
    });
    console.log("111");

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
