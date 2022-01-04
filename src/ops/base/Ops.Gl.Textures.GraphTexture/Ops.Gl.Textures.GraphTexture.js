const
    trigger = this.inTrigger("trigger"),
    value = this.inValueFloat("value"),
    index = this.inValueInt("index"),
    inReset = this.inTriggerButton("reset"),
    inShowMinMax = op.inValueBool("Show Min/Max"),
    inSeed = op.inValueFloat("Color Random Seed", 23),
    inWidth = op.inValueInt("Texture Width", 512),
    inHeight = op.inValueInt("Texture Height", 512),
    inLineWidth = op.inFloat("Line Width", 2),

    texOut = op.outTexture("Texture"),
    outCanvas = op.outObject("Canvas Element");

const cgl = op.patch.cgl;

let canvas = document.createElement("canvas");
canvas.id = "graph_" + Math.random();
canvas.width = 512;
canvas.height = 512;
// canvas.style.display   = "none";
// var body = document.getElementsByTagName("body")[0];
// body.appendChild(canvas);
outCanvas.set(canvas);

// let canvImage = document.getElementById(canvas.id);
let ctx = canvas.getContext("2d");

inWidth.onChange = inHeight.onChange = function ()
{
    canvas.width = inWidth.get();
    canvas.height = inHeight.get();
};

let buff = [];

let maxValue = -Number.MAX_VALUE;
let minValue = Number.MAX_VALUE;
let colors = [];
let lastTime = Date.now();

value.onLinkChanged = reset;
index.onLinkChanged = reset;
inReset.onTriggered = reset;

value.onChange = function ()
{
    addValue(value.get(), Math.round(index.get()));
};

trigger.onTriggered = function ()
{
    for (let i = 0; i < buff.length; i++)
        if (buff[i]) addValue(buff[i][buff[i].length - 1], i);

    updateGraph();
};

function reset()
{
    buff.length = 0;
    maxValue = -999999;
    minValue = 999999;
}

function addValue(val, currentIndex)
{
    maxValue = Math.max(maxValue, parseFloat(val));
    minValue = Math.min(minValue, parseFloat(val));

    if (!buff[currentIndex])
    {
        buff[currentIndex] = [];
        Math.randomSeed = inSeed.get() + currentIndex;

        colors[currentIndex] = "rgba(" + Math.round(Math.seededRandom() * 255) + "," + Math.round(Math.seededRandom() * 255) + "," + Math.round(Math.seededRandom() * 255) + ",1)";
    }

    let buf = buff[currentIndex];
    buf.push(val);

    if (!trigger.isLinked()) if (Date.now() - lastTime > 30)updateGraph();
}

function updateGraph()
{
    function getPos(v)
    {
        return canvas.height - ((v / h * canvas.height / 2 * 0.9) + canvas.height / 2);
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#444";
    ctx.fillRect(0, getPos(0), canvas.width, 1);

    for (let b = 0; b < buff.length; b++)
    {
        let buf = buff[b];
        if (!buf) continue;

        ctx.lineWidth = inLineWidth.get();

        var h = Math.max(Math.abs(maxValue), Math.abs(minValue));
        let heightmul = canvas.height / h;
        let start = Math.max(0, buf.length - canvas.width);

        ctx.beginPath();
        ctx.strokeStyle = colors[b];

        ctx.moveTo(0, getPos(buf[start]));

        for (let i = start; i < buf.length; i++)
        {
            ctx.lineTo(
                1 + i - start,
                getPos(buf[i]));
        }
        ctx.stroke();
    }

    ctx.font = "22px monospace";

    if (inShowMinMax.get())
    {
        ctx.fillStyle = "#fff";
        ctx.fillText("max:" + (Math.round(maxValue * 100) / 100), 10, canvas.height - 10);
        ctx.fillText("min:" + (Math.round(minValue * 100) / 100), 10, canvas.height - 30);
    }

    if (texOut.get()) texOut.get().initTexture(canvas);
    else texOut.set(new CGL.Texture.createFromImage(cgl, canvas,
        {
            "filter": CGL.Texture.FILTER_MIPMAP

        }));

    lastTime = Date.now();
}
