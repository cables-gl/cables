const filename = op.inFile("file", "image");
const tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"]);
const wrap = op.inValueSelect("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge");
const flip = op.inValueBool("flip", false);
const unpackAlpha = op.inValueBool("unpackPreMultipliedAlpha", false);
const aniso = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], 0);

const textureOut = op.outTexture("texture");
const width = op.outValue("width");
const height = op.outValue("height");
const loading = op.outValue("loading");
const ratio = op.outValue("Aspect Ratio");

op.setPortGroup("Size", [width, height]);

unpackAlpha.setUiAttribs({ "hidePort": true });

op.toWorkPortsNeedToBeLinked(textureOut);

const cgl = op.patch.cgl;
let cgl_filter = 0;
let cgl_wrap = 0;
let cgl_aniso = 0;

filename.onChange = flip.onChange = function () { reloadSoon(); };

aniso.onChange = tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;
unpackAlpha.onChange = function () { reloadSoon(); };

let timedLoader = 0;

tfilter.set("mipmap");
wrap.set("repeat");

textureOut.set(CGL.Texture.getEmptyTexture(cgl));

const setTempTexture = function ()
{
    const t = CGL.Texture.getTempTexture(cgl);
    textureOut.set(t);
};

let loadingId = null;
let tex = null;
function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        realReload(nocache);
    }, 30);
}

function realReload(nocache)
{
    if (!loadingId)loadingId = cgl.patch.loading.start(op.objName, filename.get(), op);

    let url = op.patch.getFilePath(String(filename.get()));
    if (nocache)url += "?rnd=" + CABLES.generateUUID();

    if ((filename.get() && filename.get().length > 1))
    {
        loading.set(true);

        if (tex)tex.delete();
        tex = CGL.Texture.load(cgl, url, function (err)
        {
            if (err)
            {
                setTempTexture();
                op.setUiError("errorload", "could not load texture \"" + filename.get() + "\"", 2);
                cgl.patch.loading.finished(loadingId);
                loadingId = null;
                return;
            }
            else op.setUiError("errorload", null);
            // op.uiAttr({'error':null});
            textureOut.set(tex);
            width.set(tex.width);
            height.set(tex.height);
            ratio.set(tex.width / tex.height);

            if (!tex.isPowerOfTwo())
                op.setUiError("hintnpot", "texture dimensions not power of two! - texture filtering will not work.", 0);
                // op.uiAttr(
                //     {
                //         hint:'texture dimensions not power of two! - texture filtering will not work.',
                //         warning:null
                //     });
            else
                op.setUiError("hintnpot", null);
            // op.uiAttr(
            //     {
            //         hint:null,
            //         warning:null
            //     });

            textureOut.set(null);
            textureOut.set(tex);
            // tex.printInfo();
        }, {
            "anisotropic": cgl_aniso,
            "wrap": cgl_wrap,
            "flip": flip.get(),
            "unpackAlpha": unpackAlpha.get(),
            "filter": cgl_filter
        });

        textureOut.set(null);
        textureOut.set(tex);

        if (!textureOut.get() && nocache)
        {
        }

        cgl.patch.loading.finished(loadingId);
    }
    else
    {
        cgl.patch.loading.finished(loadingId);
        setTempTexture();
    }
}

function onFilterChange()
{
    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
    else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;

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
        textureOut.set(null);
        textureOut.set(CGL.Texture.getTempTexture(cgl));

        realReload(true);

        op.refreshParams();
    }
};
