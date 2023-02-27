const exe = op.inTrigger("exe"),
    inData = op.inObject("JSON Data"),
    inPlayMode = op.inSwitch("Play Mode", ["Auto", "Frame"], "Auto"),
    inFrame = op.inFloat("frame"),
    inPlay = op.inBool("play"),
    inRewind = op.inTriggerButton("Rewind"),
    speed = op.inFloat("speed", 1),
    width = op.inInt("texture width", 1280),
    height = op.inInt("texture height", 720),
    tfilter = op.inDropDown("Filter", ["nearest", "linear", "mipmap"], "linear"),
    wrap = op.inDropDown("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    bmScale = op.inSwitch("scale", ["fit", "nofit"], "fit"),
    textureOut = op.outTexture("texture"),
    outTotalFrames = op.outNumber("Total Frames");

const cgl = op.patch.cgl;
const canvasId = "bodymovin_" + CABLES.generateUUID();
let createTexture = false;
let canvasImage = null;
let anim = null;
let ctx = null;
let canvas = null;
let cgl_filter = CGL.Texture.FILTER_LINEAR;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let lastFrame = -2;
let playmodeAuto = true;
let updateTexture = true;
let tex = null;

op.toWorkPortsNeedToBeLinked(exe, inData);

op.setPortGroup("Player Timing", [inPlayMode, inFrame, inPlay, inRewind, speed]);
op.setPortGroup("Texture Settings", [tfilter, wrap, width, height, bmScale]);

inPlayMode.onChange = updateUi;
tfilter.onChange = onLottieFilterChange;
inData.onChange = reload;
bmScale.onChange =
width.onChange =
    height.onChange = reloadForce;

inPlay.onChange = function ()
{
    if (anim)
        if (inPlay.get()) anim.play();
        else anim.pause();
};

inRewind.onTriggered = function ()
{
    if (inPlay.get()) anim.goToAndPlay(0, true);
    else anim.goToAndStop(0, true);
};

speed.onChange = function ()
{
    if (anim) anim.setSpeed(speed.get());
};

wrap.onChange = function ()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    createTexture = true;
};

function onLottieFilterChange()
{
    cgl_filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;

    createTexture = true;
}

exe.onTriggered = function ()
{
    if (!anim) return;

    outTotalFrames.set(anim.totalFrames);

    if (!canvasImage || !canvas) return;

    if (playmodeAuto)
    {
        updateTexture = true;
    }
    else
    {
        if (lastFrame != inFrame.get())
        {
            lastFrame = inFrame.get();

            if (inFrame.get() != -1.0)
            {
                anim.goToAndStop(inFrame.get(), true);
            }
            updateTexture = true;
        }
    }

    if (!textureOut.get() || createTexture)
    {
        const texOpts =
        {
            "wrap": cgl_wrap,
            "filter": cgl_filter,
            "unpackAlpha": false,
        };
        if (tex) tex.delete();
        tex = new CGL.Texture.createFromImage(cgl, canvasImage, texOpts);
        textureOut.set(tex);
        createTexture = false;
    }
    if (updateTexture && tex)
    {
        tex.initTexture(canvasImage);
        updateTexture = false;
    }
};

op.onDelete = function ()
{
    if (anim)anim.stop();
    anim = null;
};

function reloadForce()
{
    createTexture = true;
    reload(true);
}

function updateUi()
{
    playmodeAuto = inPlayMode.get() === "Auto";

    inPlay.setUiAttribs({ "greyout": !playmodeAuto });
    inRewind.setUiAttribs({ "greyout": !playmodeAuto });
    speed.setUiAttribs({ "greyout": !playmodeAuto });
    inFrame.setUiAttribs({ "greyout": playmodeAuto });

    if (anim)
    {
        if (playmodeAuto) if (inPlay.get()) anim.play();
        if (!playmodeAuto) anim.stop();
    }
}

function reload(force)
{
    if (!inData.get() || Object.keys(inData.get()).length === 0)
    {
        if (anim)anim.stop();

        anim = null;
        if (tex)tex.delete();
        tex = null;

        createTexture = true;
        canvasImage = null;
        lastFrame = -2;
        updateTexture = true;

        return;
    }

    updateUi();

    outTotalFrames.set(0);
    if (anim) anim.stop();

    if (!canvasImage || force)
    {
        if (tex)tex = tex.delete();
        if (canvas) canvas.remove();
        canvas = document.createElement("canvas");
        canvas.id = canvasId;

        canvas.width = width.get();
        canvas.height = height.get();
        canvas.style.display = "none";

        const body = document.getElementsByTagName("body")[0];
        body.appendChild(canvas);

        canvasImage = document.getElementById(canvas.id);
        ctx = canvasImage.getContext("2d");
    }

    const animData = {
        "animType": "canvas",
        "loop": false,
        "prerender": true,
        "autoplay": playmodeAuto && inPlay.get(),
        "animationData": inData.get(),
        "rendererSettings":
        {
            "context": ctx,
            "clearCanvas": true,
            "scaleMode": bmScale.get()
        }
    };

    anim = bodymovin.loadAnimation(animData);
    anim.setSpeed(speed.get());

    anim.addEventListener("DOMLoaded", function (e) // sometimes anim loading seems to be async ?
    {
        finishedLoading();
    });

    finishedLoading();
}

function finishedLoading()
{
    if (!playmodeAuto)
    {
        anim.goToAndPlay(0, true);
        lastFrame = -2;
    }
    if (playmodeAuto && inPlay.get()) anim.play();
}
