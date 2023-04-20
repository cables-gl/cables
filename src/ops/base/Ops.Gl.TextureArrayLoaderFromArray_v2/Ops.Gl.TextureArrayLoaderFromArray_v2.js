const
    filenames = op.inArray("urls"),
    tfilter = op.inDropDown("filter", ["nearest", "linear", "mipmap"], "linear"),
    wrap = op.inDropDown("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    flip = op.inBool("Flip", false),
    unpackAlpha = op.inBool("unpackPreMultipliedAlpha", false),
    inCaching = op.inBool("Caching", false),
    inPatchAsset = op.inBool("Asset in patch", false),
    arrOut = op.outArray("TextureArray"),
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    loading = op.outBoolNum("loading"),
    ratio = op.outNumber("Aspect Ratio");

op.toWorkPortsNeedToBeLinked(filenames);

const cgl = op.patch.cgl;
const arr = [];
let cgl_filter = CGL.Texture.FILTER_LINEAR;
let cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
let loadingId = null;
let timedLoader = 0;
arrOut.set(arr);

inPatchAsset.onChange =
    flip.onChange =
    unpackAlpha.onChange =
    filenames.onChange = reload;

tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;

function reload(nocache)
{
    if (!filenames.isLinked())
    {
        arrOut.setRef(null);
        return;
    }
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

    if (!inCaching.get()) if (nocache)url += "?rnd=" + CABLES.generateUUID();

    let tex = CGL.Texture.load(cgl, url,
        function (err)
        {
            if (err)
            {
                const errMsg = "could not load texture \"" + url + "\"";
                op.uiAttr({ "error": errMsg });
                op.warn("[TextureArrayLoader] " + errMsg);
                if (cb)cb();
                return;
            }
            else op.uiAttr({ "error": null });

            width.set(tex.width);
            height.set(tex.height);
            ratio.set(tex.width / tex.height);

            arr[i] = tex;

            arrOut.setRef(arr);
            if (cb)cb();
        }, {
            "wrap": cgl_wrap,
            "flip": flip.get(),
            "unpackAlpha": unpackAlpha.get(),
            "filter": cgl_filter
        });
}

function realReload(nocache)
{
    const files = filenames.get();

    if (!files || files.length == 0) return;

    if (loadingId)cgl.patch.loading.finished(loadingId);

    loadingId = cgl.patch.loading.start("texturearray", CABLES.uuid(), op);
    loading.set(true);

    for (let i = 0; i < files.length; i++)
    {
        arr[i] = CGL.Texture.getEmptyTexture(cgl);
        let cb = null;
        if (i == files.length - 1)
        {
            cb = () =>
            {
                loading.set(false);
                cgl.patch.loading.finished(loadingId);
            };
        }

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
    // should reload changed files that are used in the array
};
