let cgl = op.patch.cgl;

op.name = "Performance";

let exe = this.addInPort(new CABLES.Port(this, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let trigger = this.addOutPort(new CABLES.Port(this, "trigger", CABLES.OP_PORT_TYPE_FUNCTION));
let textureOut = this.addOutPort(new CABLES.Port(this, "texture", CABLES.OP_PORT_TYPE_TEXTURE));
let outFPS = this.addOutPort(new CABLES.Port(this, "fps", CABLES.OP_PORT_TYPE_VALUE));

let drawGraph = op.inValueBool("Draw Graph", true);
let enabled = op.inValueBool("enabled", true);
let numBars = 256;

let canvas = document.createElement("canvas");
canvas.id = "performance_" + op.patch.config.glCanvasId;
canvas.width = 512;
canvas.height = 128;
canvas.style.display = "block";
canvas.style["z-index"] = "99999";
let body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

if (!CABLES.UI)
{
    canvas.style.position = "absolute";
    canvas.style.bottom = "0px";
}

let fontImage = document.getElementById(canvas.id);
let ctx = canvas.getContext("2d");

let text = "";

ctx.font = "12px monospace";
ctx.fillStyle = "white";

let frames = 0;
let fps = 0;
let fpsStartTime = 0;

let lastTime = 0;
let childsTime = 0;

let queue = [];
let queueChilds = [];
for (let i = 0; i < numBars; i++)
{
    queue[i] = -1;
    queueChilds[i] = -1;
}

let avgMs = 0;
let avgMsChilds = 0;
let text2 = "";
let text3 = "";
let warn = "";

let ll = 0;
let selfTime = 0;
let hasErrors = false;
let countFrames = 0;

function refresh()
{
    if (!enabled.get())
    {
        trigger.trigger();
        return;
    }
    ll = performance.now();

    let ms = performance.now() - lastTime;
    queue.push(ms);
    queue.shift();

    queueChilds.push(childsTime);
    queueChilds.shift();

    frames++;

    if (fpsStartTime === 0)fpsStartTime = Date.now();
    if (Date.now() - fpsStartTime >= 1000)
    {
        fps = frames;
        frames = 0;
        outFPS.set(fps);

        text = op.patch.config.glCanvasId + " fps: " + fps;

        if (op.patch.config.fpsLimit != 0)
            text += " (limit " + op.patch.config.fpsLimit + ") ";

        text += " " + cgl.canvas.clientWidth + " x " + cgl.canvas.clientHeight;

        fpsStartTime = Date.now();
        warn = "";
        if (op.patch.cgl.profileData.profileShaderCompiles > 0)warn += "Shader compile! ";
        if (op.patch.cgl.profileData.profileShaderGetUniform > 0)warn += "Shader get uni loc! ";
        if (op.patch.cgl.profileData.profileAttrLoc > 0)warn += "Shader get attrib loc! ";

        if (op.patch.cgl.profileData.profileTextureResize > 0)warn += "Texture resize! ";
        if (op.patch.cgl.profileData.profileFrameBuffercreate > 0)warn += "Framebuffer create! ";
        if (op.patch.cgl.profileData.profileEffectBuffercreate > 0)warn += "Effectbuffer create! ";
        if (op.patch.cgl.profileData.profileTextureDelete > 0)warn += "Texture delete! ";

        let count = 0;
        for (let i = queue.length; i > queue.length - queue.length / 3; i--)
        {
            if (queue[i] > -1)
            {
                avgMs += queue[i];
                count++;
            }

            if (queueChilds[i] > -1)
            {
                avgMsChilds += queueChilds[i];
            }
        }
        avgMs /= count;
        avgMsChilds /= count;

        text2 = "frame avg: " + Math.round(avgMsChilds * 100) / 100 + " ms (" + Math.round(avgMsChilds / avgMs * 100) + "%) / " + Math.round(avgMs * 100) / 100 + " ms";
        text3 = "shader binds: " + Math.ceil(op.patch.cgl.profileData.profileShaderBinds / fps) + " uniforms: " + Math.ceil(op.patch.cgl.profileData.profileUniformCount / fps);
        text3 += " (self: " + Math.round((selfTime) * 100) / 100 + " ms) ";

        op.patch.cgl.profileData.profileUniformCount = 0;
        op.patch.cgl.profileData.profileShaderGetUniform = 0;
        op.patch.cgl.profileData.profileShaderCompiles = 0;
        op.patch.cgl.profileData.profileShaderBinds = 0;
        op.patch.cgl.profileData.profileTextureResize = 0;
        op.patch.cgl.profileData.profileFrameBuffercreate = 0;
        op.patch.cgl.profileData.profileEffectBuffercreate = 0;
        op.patch.cgl.profileData.profileTextureDelete = 0;
        op.patch.cgl.profileData.profileAttrLoc = 0;
    }

    // ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (drawGraph.get())
    {
        ctx.fillStyle = "#555555";
        let k = 0;
        for (k = numBars; k >= 0; k--)
        {
            ctx.fillRect(numBars - k, canvas.height - queue[k] * 2.5, 1, queue[k] * 2.5);
        }

        ctx.fillStyle = "#aaaaaa";
        for (k = numBars; k >= 0; k--)
        {
            ctx.fillRect(numBars - k, canvas.height - queueChilds[k] * 2.5, 1, queueChilds[k] * 2.5);
        }
    }

    ctx.fillStyle = "#cccccc";
    ctx.fillText(text, 10, 20);
    ctx.fillText(text2, 10, 35);
    ctx.fillText(text3, 10, 50);
    ctx.fillStyle = "#ff4400";
    if (warn !== "")ctx.fillText("WARNING: " + warn, 10, 65);

    if (hasErrors)
    {
        ctx.fillStyle = "#ff8844";
        ctx.fillText("has errors!", 10, 65);
    }

    ctx.restore();

    if (textureOut.isLinked())
    {
        if (textureOut.get()) textureOut.get().initTexture(cgl, fontImage);
        else textureOut.set(new CGL.Texture.fromImage(cgl, fontImage));
    }

    lastTime = performance.now();
    selfTime = performance.now() - ll;

    let startTimeChilds = performance.now();

    trigger.trigger();

    childsTime = performance.now() - startTimeChilds;

    countFrames++;
    if (countFrames == 30)
    {
        hasErrors = false;
        // var error = cgl.gl.getError();
        // if (error != cgl.gl.NO_ERROR)
        // {
        //     hasErrors=true;
        // }
        countFrames = 0;
    }
}

this.onDelete = function ()
{
    document.getElementById(canvas.id).remove();
};

exe.onTriggered = refresh;
if (CABLES.UI)gui.setLayout();
