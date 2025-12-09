const exe = op.inTrigger("exe"),
    filename = op.inUrl("File"),
    play = op.inBool("play"),
    tfilter = op.inDropDown("filter", ["nearest", "linear", "mipmap"], "linear", "linear"),
    wrap = op.inDropDown("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    flip = op.inBool("flip"),
    width = op.inInt("texture width", 1280),
    height = op.inInt("texture height", 720),
    bmScale = op.inSwitch("scale", ["fit", "nofit"], "fit"),
    rewind = op.inTriggerButton("rewind"),
    speed = op.inFloat("speed", 1),
    frame = op.inFloat("frame"),
    textureOut = op.outTexture("texture"),
    outTotalFrames = op.outNumber("Total Frames");

const cgl = op.patch.cgl;
const canvasId = "bodymovin_" + CABLES.generateUUID();
let createTexture = false;
let canvasImage = null;
let anim = null;
let ctx = null;
let canvas = null;
let cgl_filter = CGL.Texture.FILTER_NEAREST;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let lastFrame = -2;

tfilter.onChange = onLottieFilterChange;
filename.onChange = reload;

bmScale.onChange =
    width.onChange =
    height.onChange = reloadForce;

play.onChange = function ()
{
    if (anim)
        if (play.get()) anim.play();
        else anim.pause();
};

rewind.onTriggered = function ()
{
    anim.goToAndPlay(0, true);
};

speed.onChange = function ()
{
    if (anim) anim.setSpeed(speed.get());
};

flip.onChange = function ()
{
    createTexture = true;
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
    if (anim)outTotalFrames.set(anim.totalFrames);

    if (!canvasImage || !canvas) return;

    if (lastFrame != frame.get())
    {
        if (frame.get() != -1.0)
        {
            anim.goToAndStop(frame.get(), true);
        }

        if (!textureOut.get() || createTexture)
        {
            const texOpts =
            {
                "wrap": cgl_wrap,
                "filter": cgl_filter,
                "flip": flip.get()
            };

            textureOut.set(new CGL.Texture.createFromImage(cgl, canvasImage, texOpts));
            createTexture = false;
        }
        else
        {
            textureOut.get().initTexture(canvasImage);
        }
        lastFrame = frame.get();
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

function reload(force)
{
    outTotalFrames.set(0);
    if (anim)
    {
        anim.stop();
    }

    if (!canvasImage || force)
    {
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
        "autoplay": true,
        "path": filename.get(),
        "rendererSettings":
        {
            "context": ctx,
            "clearCanvas": true,
            "scaleMode": bmScale.get()
        }
    };

    anim = bodymovin.loadAnimation(animData);
    anim.setSpeed(speed.get());
    anim.play();

    anim.addEventListener("DOMLoaded", function (e)
    {
        lastFrame = -1;
    });
}
