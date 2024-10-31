const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"]),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),
    dataFrmt = op.inSwitch("Data Format", ["R", "RG", "RGB", "RGBA", "SRGBA"], "RGBA"),
    flip = op.inValueBool("Flip", false),
    unpackAlpha = op.inValueBool("Pre Multiplied Alpha", false),
    active = op.inValueBool("Active", true),
    inFreeMemory = op.inBool("Save Memory", true),
    textureOut = op.outTexture("Texture"),
    addCacheBust = op.inBool("Add Cachebuster", false),
    inReload = op.inTriggerButton("Reload"),
    width = op.outNumber("Width"),
    height = op.outNumber("Height"),
    ratio = op.outNumber("Aspect Ratio"),
    loaded = op.outBoolNum("Loaded", 0),
    loading = op.outBoolNum("Loading", 0);

const cgl = op.patch.cgl;

op.toWorkPortsNeedToBeLinked(textureOut);
op.setPortGroup("Size", [width, height]);

let loadedFilename = null;
let loadingId = null;
let tex = null;
let cgl_filter = CGL.Texture.FILTER_MIPMAP;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let cgl_aniso = 0;
let timedLoader = 0;

unpackAlpha.setUiAttribs({ "hidePort": true });
unpackAlpha.onChange =
    filename.onChange =
    dataFrmt.onChange =
    addCacheBust.onChange =
    flip.onChange = reloadSoon;
aniso.onChange = tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;

tfilter.set("mipmap");
wrap.set("repeat");

textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));

inReload.onTriggered = reloadSoon;

active.onChange = function ()
{
    if (active.get())
    {
        if (loadedFilename != filename.get() || !tex) reloadSoon();
        else textureOut.setRef(tex);
    }
    else
    {
        textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));
        width.set(CGL.Texture.getEmptyTexture(cgl).width);
        height.set(CGL.Texture.getEmptyTexture(cgl).height);
        if (tex)tex.delete();
        op.setUiAttrib({ "extendTitle": "" });
        tex = null;
    }
};

const setTempTexture = function ()
{
    const t = CGL.Texture.getTempTexture(cgl);
    textureOut.setRef(t);
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        realReload(nocache);
    }, 1);
}

function getPixelFormat()
{
    if (dataFrmt.get() == "R") return CGL.Texture.PFORMATSTR_R8UB;
    if (dataFrmt.get() == "RG") return CGL.Texture.PFORMATSTR_RG8UB;
    if (dataFrmt.get() == "RGB") return CGL.Texture.PFORMATSTR_RGB8UB;
    if (dataFrmt.get() == "SRGBA") return CGL.Texture.PFORMATSTR_SRGBA8;

    return CGL.Texture.PFORMATSTR_RGBA8UB;
}

function realReload(nocache)
{
    op.checkMainloopExists();
    if (!active.get()) return;
    if (loadingId)loadingId = cgl.patch.loading.finished(loadingId);

    loadingId = cgl.patch.loading.start(op.objName, filename.get(), op);

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

        op.setUiAttrib({ "extendTitle": CABLES.basename(url) });
        if (needsRefresh) op.refreshParams();

        cgl.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);
            CGL.Texture.load(cgl, url, function (err, newTex)
            {
                cgl.checkFrameStarted("texture inittexture");

                if (filename.get() != fileToLoad)
                {
                    loadingId = cgl.patch.loading.finished(loadingId);
                    return;
                }

                if (tex)tex.delete();

                if (err)
                {
                    const t = CGL.Texture.getErrorTexture(cgl);
                    textureOut.setRef(t);

                    op.setUiError("urlerror", "could not load texture: \"" + filename.get() + "\"", 2);
                    loadingId = cgl.patch.loading.finished(loadingId);
                    return;
                }

                // textureOut.setRef(newTex);

                width.set(newTex.width);
                height.set(newTex.height);
                ratio.set(newTex.width / newTex.height);

                // if (!newTex.isPowerOfTwo()) op.setUiError("npot", "Texture dimensions not power of two! - Texture filtering will not work in WebGL 1.", 0);
                // else op.setUiError("npot", null);

                tex = newTex;
                // textureOut.setRef(null);
                textureOut.setRef(tex);

                loading.set(false);
                loaded.set(true);

                if (inFreeMemory.get()) tex.image = null;

                if (loadingId)
                {
                    loadingId = cgl.patch.loading.finished(loadingId);
                }
                op.checkMainloopExists();
            }, {
                "anisotropic": cgl_aniso,
                "wrap": cgl_wrap,
                "flip": flip.get(),
                "unpackAlpha": unpackAlpha.get(),
                "pixelFormat": getPixelFormat(),
                "filter": cgl_filter
            });

            op.checkMainloopExists();
        });
    }
    else
    {
        setTempTexture();
        loadingId = cgl.patch.loading.finished(loadingId);
    }
}

function onFilterChange()
{
    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
    else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;
    aniso.setUiAttribs({ "greyout": cgl_filter != CGL.Texture.FILTER_MIPMAP });

    cgl_aniso = parseFloat(aniso.get());

    reloadSoon();
}

function onWrapChange()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reloadSoon();
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
