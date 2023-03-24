const USE_LEFT_PAD_DEFAULT = false;

const filename = op.inString("Url");
const leftPadFilename = op.inBool("Left Pad", USE_LEFT_PAD_DEFAULT);
const numberLengthPort = op.inInt("Num Digits", 3);
numberLengthPort.setUiAttribs({ "hidePort": !USE_LEFT_PAD_DEFAULT, "greyout": !USE_LEFT_PAD_DEFAULT });

const indexStart = op.inInt("Index Start");
const indexEnd = op.inInt("Index End");

const tfilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"]);
const wrap = op.inValueSelect("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge");
const flip = op.inBool("Flip", false);
const unpackAlpha = op.inBool("unpackPreMultipliedAlpha", false);

const arrOut = op.outArray("TextureArray");

const width = op.outNumber("Width");
const height = op.outNumber("Height");
const loading = op.outBool("Loading");
const ratio = op.outNumber("Aspect Ratio");

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
        loading.set(1);

        var tex = CGL.Texture.load(cgl, url,
            function (err)
            {
                if (err)
                {
                    console.warn("error loading texture", url, err);
                    setTempTexture();
                    return;
                }
                width.set(tex.width);
                height.set(tex.height);
                ratio.set(tex.width / tex.height);

                arr[i - parseInt(indexStart.get())] = tex;

                arrOut.setRef(arr);
            }, {
                "wrap": cgl_wrap,
                "flip": flip.get(),
                "unpackAlpha": unpackAlpha.get(),
                "filter": cgl_filter
            });

        loading.set(0);
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
};

tfilter.set("linear");
wrap.set("repeat");
