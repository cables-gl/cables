const
    filename = op.inUrl("File", [".ktx2"]),
    textureOut = op.outTexture("Texture"),
    addCacheBust = op.inBool("Add Cachebuster", false),
    inReload = op.inTriggerButton("Reload"),
    inActive = op.inBool("Active", true),
    width = op.outNumber("Width"),
    height = op.outNumber("Height"),
    outIsRGB = op.outBoolNum("IsSrgb", false),
    ratio = op.outNumber("Aspect Ratio"),
    loaded = op.outBoolNum("Loaded", 0),
    loading = op.outBoolNum("Loading", 0);

const cgl = op.patch.cgl;

// op.toWorkPortsNeedToBeLinked(textureOut);
op.setPortGroup("Size", [width, height]);
let ktx = CABLES.ktx;

inActive.onChange = () =>
{
    if (inActive.get()) reloadSoon();
    else
    {
        textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));
    }
};

/// /////////////////////////////////////////////////////

let loadedFilename = null;
let loadingId = null;
let tex = null;
let cgl_filter = CGL.Texture.FILTER_MIPMAP;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let cgl_aniso = 0;
let timedLoader = 0;

filename.onChange = reloadSoon;

textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));

inReload.onTriggered = reloadSoon;

const setTempTexture = function ()
{
    const t = CGL.Texture.getTempTexture(cgl);
    textureOut.setRef(t);
};

function reloadSoon(nocache)
{
    if (!inActive.get()) return;
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        realReload(nocache);
    }, 1);
}

function realReload(nocache)
{
    if (!CABLES.ktx) return;
    op.checkMainloopExists();
    if (loadingId) loadingId = op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start(op.objName, filename.get(), op);

    let url = op.patch.getFilePath(String(filename.get()));

    if (addCacheBust.get() || nocache === true) url = CABLES.cacheBust(url);

    if (String(filename.get()).indexOf("data:") == 0) url = filename.get();

    let needsRefresh = false;
    loadedFilename = filename.get();

    if ((filename.get() && filename.get().length > 1))
    {
        loaded.set(false);
        loading.set(true);

        const fileToLoad = filename.get();
        setTempTexture();
        op.setUiAttrib({ "extendTitle": CABLES.basename(url) });
        if (needsRefresh) op.refreshParams();

        op.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);

            loadKtx(url, (t) =>
            {
                textureOut.setRef(t);
            }, {});

            op.checkMainloopExists();
        });
    }
    else
    {
        setTempTexture();
        loadingId = op.patch.loading.finished(loadingId);
    }
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        textureOut.setRef(CGL.Texture.getEmptyTexture(op.patch.cgl));
        textureOut.setRef(CGL.Texture.getTempTexture(cgl));
        realReload(true);
    }
};
/// //////////////////
function loadKtx(url, cb, opts)
{
    if (!CABLES.ktx) return op.logError("no ktx");
    op.checkMainloopExists();
    if (loadingId) loadingId = op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start(op.objName, CABLES.uuid(), op);

    if (url)
    {
        op.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);

            CABLES.ktx.load(url, (transcodeResult) =>
            {
                const ctex = new CGL.Texture(op.patch.cgl,
                    {
                        "compression": true,
                        "wrap": opts?.wrap || CGL.Texture.WRAP_REPEAT,
                        "filter": opts?.filter || CGL.Texture.FILTER_LINEAR,
                        "name": "ktx " + opts.name + transcodeResult.width + "x" + transcodeResult.height,
                        "width": transcodeResult.width,
                        "height": transcodeResult.height
                    });

                ctex.setFormat({ "glDataFormat": transcodeResult.format });

                ctex.width = transcodeResult.width;
                ctex.height = transcodeResult.height;
                ctex.initFromMipMapData(transcodeResult.faces[0].mipmaps);
                cb(ctex);

            }, () =>
            {
                // console.log("ktx progress");
            }, (e) => {});

            if (loadingId) loadingId = op.patch.loading.finished(loadingId);

        });
        op.checkMainloopExists();

    }
    else
    {
        setTempTexture();
        loadingId = op.patch.loading.finished(loadingId);
    }
}
