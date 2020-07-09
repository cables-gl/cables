const filenames = op.inArray("urls");

const tfilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"]);
const wrap = op.inValueSelect("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge");
const flip = op.addInPort(new CABLES.Port(op, "flip", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
const unpackAlpha = op.addInPort(new CABLES.Port(op, "unpackPreMultipliedAlpha", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
const inCaching = op.inBool("Caching", false);
const arrOut = op.outArray("TextureArray");

// var textureOut=op.outTexture("texture");
const width = op.addOutPort(new CABLES.Port(op, "width", CABLES.OP_PORT_TYPE_VALUE));
const height = op.addOutPort(new CABLES.Port(op, "height", CABLES.OP_PORT_TYPE_VALUE));
const loading = op.addOutPort(new CABLES.Port(op, "loading", CABLES.OP_PORT_TYPE_VALUE));
const ratio = op.outValue("Aspect Ratio");

flip.set(false);
unpackAlpha.set(false);

const cgl = op.patch.cgl;
let cgl_filter = 0;
let cgl_wrap = 0;
let loadingId = null;
const arr = [];
arrOut.set(arr);

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

    // console.log(url);

    url = op.patch.getFilePath(url);
    if (!inCaching.get())
        if (nocache)url += "?rnd=" + CABLES.generateUUID();

    // if((filename.get() && filename.get().length>1))
    {
        loading.set(true);

        var tex = CGL.Texture.load(cgl, url,
            function (err)
            {
                // console.log('tex loaded!!');

                if (err)
                {
                    setTempTexture();
                    const errMsg = "could not load texture \"" + url + "\"";
                    op.uiAttr({ "error": errMsg });
                    console.warn("[TextureArrayLoader] " + errMsg);
                    if (cb)cb();
                    return;
                }
                else op.uiAttr({ "error": null });
                // textureOut.set(tex);
                width.set(tex.width);
                height.set(tex.height);
                ratio.set(tex.width / tex.height);


                arr[i] = tex;
                if (!tex.isPowerOfTwo()) op.uiAttr(
                    {
                        "hint": "texture dimensions not power of two! - texture filtering will not work.",
                        "warning": null
                    });
                else op.uiAttr(
                    {
                        "hint": null,
                        "warning": null
                    });

                arrOut.set(null);
                arrOut.set(arr);
                if (cb)cb();
            }, {
                "wrap": cgl_wrap,
                "flip": flip.get(),
                "unpackAlpha": unpackAlpha.get(),
                "filter": cgl_filter
            });


        // textureOut.set(null);
        // textureOut.set(tex);

        // if(!textureOut.get() && nocache)
        // {
        // }
        loading.set(false);
    }
}

function realReload(nocache)
{
    const files = filenames.get();

    if (!files || files.length == 0) return;

    if (loadingId)cgl.patch.loading.finished(loadingId);
    loadingId = cgl.patch.loading.start("texturearray", CABLES.uuid());

    // arr.length=files.length;


    for (let i = 0; i < files.length; i++)
    {
        arr[i] = CGL.Texture.getEmptyTexture(cgl);
        let cb = null;
        if (i == files.length - 1)cb = function ()
        {
            cgl.patch.loading.finished(loadingId);
            // console.log('loaded all');
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
    // if(filename.get() && filename.get().indexOf(fn)>-1)
    // {
    //     textureOut.set(null);
    //     textureOut.set(CGL.Texture.getTempTexture(cgl));

    //     realReload(true);
    // }
};


tfilter.set("linear");
wrap.set("repeat");
