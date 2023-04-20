const
    filenames = op.inArray("urls"),
    tfilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"]),
    wrap = op.inValueSelect("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    flip = op.addInPort(new CABLES.Port(op, "flip", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" })),
    unpackAlpha = op.addInPort(new CABLES.Port(op, "unpackPreMultipliedAlpha", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" })),
    inCaching = op.inBool("Caching", false),
    inPatchAsset = op.inBool("Asset in patch", false),
    arrOut = op.outArray("TextureArray"),
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    loading = op.outBoolNum("loading"),
    ratio = op.outNumber("Aspect Ratio");

flip.set(false);
unpackAlpha.set(false);

const cgl = op.patch.cgl;
let cgl_filter = 0;
let cgl_wrap = 0;
let loadingId = null;
const arr = [];
arrOut.set(arr);

inPatchAsset.onChange =
flip.onChange = function () { reload(); };
filenames.onChange = reload;

tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;
unpackAlpha.onChange = function () { reload(); };

let timedLoader = 0;

const setTempTexture = function ()
{
    const t = CGL.Texture.getTempTexture(cgl);
    // textureOut.set(t);
};

function reload(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        realReload(nocache);
    }, 30);
}

function loadImage(_i, _url, nocache, cb)
{
    let url = _url;
    const i = _i;
    if (!url) return;
    // url=url.replace("XXX",i);

    if (inPatchAsset.get())
    {
        let patchId = null;
        if (op.storage && op.storage.blueprint && op.storage.blueprint.patchId)
        {
            patchId = op.storage.blueprint.patchId;
        }
        url = op.patch.getAssetPath(patchId) + url;
    }

    url = op.patch.getFilePath(url);
    if (!inCaching.get())
        if (nocache)url += "?rnd=" + CABLES.generateUUID();

    // if((filename.get() && filename.get().length>1))
    {
        loading.set(true);

        let tex = CGL.Texture.load(cgl, url,
            function (err)
            {
                if (err)
                {
                    setTempTexture();
                    const errMsg = "could not load texture \"" + url + "\"";
                    op.setUiError("error", errMsg);
                    op.warn("[TextureArrayLoader] " + errMsg);
                    if (cb)cb();
                    return;
                }
                else op.setUiError("error", null);
                // textureOut.set(tex);
                width.set(tex.width);
                height.set(tex.height);
                ratio.set(tex.width / tex.height);

                arr[i] = tex;

                arrOut.set(null);
                arrOut.set(arr);
                if (cb)cb();
            }, {
                "wrap": cgl_wrap,
                "flip": flip.get(),
                "unpackAlpha": unpackAlpha.get(),
                "filter": cgl_filter
            });

        loading.set(false);
    }
}

function realReload(nocache)
{
    const files = filenames.get();

    if (!files || files.length == 0) return;

    // if (loadingId)cgl.patch.loading.finished(loadingId);
    loadingId = cgl.patch.loading.start("texturearray", CABLES.uuid(), op);

    for (let i = 0; i < files.length; i++)
    {
        arr[i] = CGL.Texture.getEmptyTexture(cgl);
        let cb = null;
        if (i == files.length - 1)cb = function ()
        {
            loadingId = cgl.patch.loading.finished(loadingId);
        };

        if (!files[i]) { if (cb) cb(); }
        else loadImage(i, files[i], nocache, cb);
    }
}

function onFilterChange()
{
    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;

    reload();
}

function onWrapChange()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reload();
}

op.onFileChanged = function (fn)
{

};

tfilter.set("linear");
wrap.set("repeat");
