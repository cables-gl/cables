const USE_LEFT_PAD_DEFAULT = false;

// var filename=op.addInPort(new CABLES.Port(op,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));
const filename = op.inValueString("url");
const leftPadFilename = op.inValueBool("Left Pad", USE_LEFT_PAD_DEFAULT);
const numberLengthPort = op.inValue("Num Digits", 3);
numberLengthPort.setUiAttribs({ "hidePort": !USE_LEFT_PAD_DEFAULT, "greyout": !USE_LEFT_PAD_DEFAULT });

const indexStart = op.inValueInt("Index Start");
const indexEnd = op.inValueInt("Index End");

const tfilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"]);
const wrap = op.inValueSelect("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge");
const flip = op.addInPort(new CABLES.Port(op, "flip", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
const unpackAlpha = op.addInPort(new CABLES.Port(op, "unpackPreMultipliedAlpha", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));

const arrOut = op.outArray("TextureArray");

// var textureOut=op.outTexture("texture");
const width = op.addOutPort(new CABLES.Port(op, "width", CABLES.OP_PORT_TYPE_VALUE));
const height = op.addOutPort(new CABLES.Port(op, "height", CABLES.OP_PORT_TYPE_VALUE));
const loading = op.addOutPort(new CABLES.Port(op, "loading", CABLES.OP_PORT_TYPE_VALUE));
const ratio = op.outValue("Aspect Ratio");

indexEnd.set(10);
flip.set(false);
unpackAlpha.set(false);

const cgl = op.patch.cgl;
let cgl_filter = 0;
let cgl_wrap = 0;

const arr = [];
arrOut.set(arr);

flip.onChange = function () { reload(); };
filename.onChange = reload;

tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;
unpackAlpha.onChange = function () { reload(); };

leftPadFilename.onChange = setNumberLengthPortVisibility;

let timedLoader = 0;

function setNumberLengthPortVisibility()
{
    const doLeftPad = leftPadFilename.get();
    numberLengthPort.setUiAttribs({ "hidePort": !doLeftPad, "greyout": !doLeftPad });
}

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

const REPLACE_CHARACTER = "X";

function pad(value, length)
{
    return (value.toString().length < length) ? pad("0" + value, length) : value;
}

function loadImage(i, nocache)
{
    let url = filename.get();
    if (!url) return;
    const firstXIndex = url.indexOf(REPLACE_CHARACTER);
    const lastXIndex = url.lastIndexOf(REPLACE_CHARACTER);
    if (firstXIndex === -1) { return; }
    const replaceString = url.substring(firstXIndex, lastXIndex + 1);
    let numberString = i;
    if (leftPadFilename.get())
    {
        numberString = pad(i, numberLengthPort.get());
    }
    url = url.replace(replaceString, numberString);
    url = op.patch.getFilePath(url);

    if (nocache)url += "?rnd=" + CABLES.generateUUID();

    if ((filename.get() && filename.get().length > 1))
    {
        loading.set(true);

        var tex = CGL.Texture.load(cgl, url,
            function (err)
            {
                if (err)
                {
                    setTempTexture();
                    op.uiAttr({ "error": "could not load texture \"" + filename.get() + "\"" });
                    return;
                }
                else op.uiAttr({ "error": null });
                // textureOut.set(tex);
                width.set(tex.width);
                height.set(tex.height);
                ratio.set(tex.width / tex.height);

                arr[i - parseInt(indexStart.get())] = tex;
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

                // textureOut.set(null);
                // textureOut.set(tex);

                // tex.printInfo();
                arrOut.set(null);
                arrOut.set(arr);
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
    else
    {
        setTempTexture();
    }
}

function realReload(nocache)
{
    for (var i = 0; i < arr.length; i++)
    {
        if (arr[i])
        {
            arr[i].delete();
        }
    }
    arr.length = 0;
    for (var i = Math.floor(indexStart.get()); i <= Math.floor(indexEnd.get()); i++)
    {
        loadImage(i, nocache);
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
