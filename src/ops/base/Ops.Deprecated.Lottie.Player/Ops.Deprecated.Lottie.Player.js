const exe = op.inTrigger("exe");
const filename = op.addInPort(new CABLES.Port(op, "file", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string", "filter": "json" }));

const play = op.addInPort(new CABLES.Port(op, "play", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));

const tfilter = op.addInPort(new CABLES.Port(op, "filter", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["nearest", "linear", "mipmap"] }));
const wrap = op.addInPort(new CABLES.Port(op, "wrap", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["repeat", "mirrored repeat", "clamp to edge"] }));
const flip = op.addInPort(new CABLES.Port(op, "flip", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));

const width = op.addInPort(new CABLES.Port(op, "texture width"));
const height = op.addInPort(new CABLES.Port(op, "texture height"));

const bmScale = op.addInPort(new CABLES.Port(op, "scale", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["fit", "nofit"] }));

const rewind = op.addInPort(new CABLES.Port(op, "rewind", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
const speed = op.addInPort(new CABLES.Port(op, "speed"));
const frame = op.addInPort(new CABLES.Port(op, "frame"));

const textureOut = op.outTexture("texture");

const canvasId = "bodymovin_" + CABLES.generateUUID();

let canvasImage = null;
const cgl = op.patch.cgl;

let anim = null;
let ctx = null;
let canvas = null;
let cgl_filter = CGL.Texture.FILTER_NEAREST;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let createTexture = false;
let wasloaded = false;
let loadingId = null;

bmScale.set("fit");
tfilter.set("linear");
tfilter.onChange = onFilterChange;
filename.onChange = reload;

bmScale.onChange = reloadForce;
width.onChange = reloadForce;
height.onChange = reloadForce;

speed.set(1);
width.set(1280);
height.set(720);

play.onChange = function ()
{
    if (play.get())
    {
        anim.play();

        // updateTexture();
    }
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
    // op.log(wrap.get());
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    createTexture = true;
};

function onFilterChange()
{
    cgl_filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;

    createTexture = true;
}

let lastFrame = -2;
exe.onTriggered = function ()
{
    if (!canvasImage || !canvas) return;

    if (!wasloaded && anim.isLoaded)
    {
        wasloaded = true;
        lastFrame = -10000;
    }

    if (lastFrame != frame.get())
    {
        lastFrame = frame.get();
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
    }
};

op.onDelete = function ()
{
    op.log("delete bodymovin...");
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
    if (anim)
    {
        anim.stop();
    }

    if (!canvasImage || force)
    {
        op.log("create canvas...");
        if (canvas)
        {
            canvas.remove();
        }
        canvas = document.createElement("canvas");
        canvas.id = canvasId;
        op.log("canvasId", canvasId);

        canvas.width = width.get();
        canvas.height = height.get();

        op.log("canvas size", canvas.width, canvas.height);

        canvas.style.display = "none";
        // canvas.style['z-index']   = "99999";
        const body = document.getElementsByTagName("body")[0];
        body.appendChild(canvas);

        canvasImage = document.getElementById(canvas.id);
        ctx = canvasImage.getContext("2d");
    }

    wasloaded = false;
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
    cgl.patch.loading.finished(loadingId);
    loadingId = cgl.patch.loading.start(op.objName, filename.get());

    anim = bodymovin.loadAnimation(animData);
    anim.addEventListener("DOMLoaded", () =>
    {
        console.log("loaded!");
        cgl.patch.loading.finished(loadingId);
    });

    anim.setSpeed(speed.get());
    anim.play();
}
