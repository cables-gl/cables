const
    trig = op.inTrigger("trigger"),
    next = op.outTrigger("next");

let ctx = null;
let canvas = null;
let numBars = 120;
let height = 50;
let containerEle = document.body;
let queueCPU = [];
let queueGPU = [];
let queueEvents = [];
let heavyEvents = [];
let countersPerFrame = {};
let gpuTimeMs = 0;
let fps = 0;
let fpsCounter = 0;
let fpsTime = performance.now();
let countIndex = 0;
let selectedCounterIndex = "meshDrawCalls";

let type = null;
let gpuBeginFrame = null;
let gpuEndFrame = null;
let gpuUpdate = null;

op.patch.on("heavyEvent", (e) => { heavyEvents.push(e.event); });

createCanvas();

trig.onTriggered = () =>
{
    const startTime = performance.now();

    if (gpuBeginFrame) gpuBeginFrame();
    next.trigger();

    queueCPU.push({ "ms": performance.now() - startTime });
    queueCPU.shift();
    if (gpuEndFrame) gpuEndFrame();
};

const frameListener = op.patch.on("renderedFrame", (e) =>
{
    if (gpuUpdate) gpuUpdate();
    type = e.type;
    const cr = e.canvas.getBoundingClientRect();
    canvas.style.top = (cr.top + cr.height - canvas.height) + "px";
    canvas.style.left = cr.left + "px";

    queueEvents.push({ "num": heavyEvents.length, "name": heavyEvents.join(",") });
    queueEvents.shift();

    queueGPU.push({ "ms": gpuTimeMs });
    queueGPU.shift();

    for (const i in op.patch.cgl.perfProfiler.counts)
    {
        countersPerFrame[i] = countersPerFrame[i] || [];
        countersPerFrame[i].push({ "num": op.patch.cgl.perfProfiler.counts[i] });
        if (countersPerFrame[i].length > numBars) countersPerFrame[i].shift();
    }

    op.patch.cgl.perfProfiler.reset();

    heavyEvents.length = 0;

    if (!gpuBeginFrame && type == "webgl")
    {
        gpuBeginFrame = glBeginFrame;
        gpuEndFrame = glEndFrame;
        gpuUpdate = glUpdate;
    }

    fpsCounter++;
    if (performance.now() - fpsTime >= 1000)
    {
        fps = fpsCounter;
        fpsTime = performance.now();
        fpsCounter = 0;
    }
    updateCanvas();
});

op.on("delete", () =>
{
    canvas.remove();
    op.patch.off(frameListener);
});

function drawGraph(name, posy, q, col, fps)
{
    let info = "";
    let k = 0;
    let maxMs = 25;
    if (q[numBars - 1] && q[numBars - 1].num)
    {
        info = q[numBars - 1].num;
        for (k = numBars; k >= 0; k--)
        {
            if (q[k])
                maxMs = Math.max(maxMs, q[k].num * 1.25);
        }
        // maxMs = info * 2;
    }
    let hmul = height / maxMs;
    if (q.length == 0)
        for (let i = 0; i < numBars; i++) q.push({ "ms": 0 });

    ctx.globalAlpha = 1;

    let avg = 0;
    for (k = numBars; k >= 0; k--)
    {
        if (q[k])
        {
            const itemHeight = Math.min(maxMs, ((q[k].ms || q[k].num || 0) * hmul));
            if (q[k].ms > 30) ctx.fillStyle = "#ff0000";
            else ctx.fillStyle = col;
            ctx.fillRect(numBars - k, posy + height - itemHeight, 1, itemHeight); // Math.min(1, q[k].ms * hmul));

            if (q[k].name && k > numBars - 30) info += q[k].name;
            avg += q[k].ms || 0;
        }
    }

    ctx.fillStyle = "#FFFFFF";
    let title = name + " ";
    if (avg)
    {
        avg = (avg / numBars).toPrecision(2);
        title += avg + "ms";
    }

    ctx.globalAlpha = 0.7;
    ctx.fillText(title, 5, posy + 16);

    if (info) ctx.fillText(info, 5, posy + 32);
}

function updateCanvas()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "11px monospace";
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#555555";
    for (let y = height; y < canvas.height; y += height)
        ctx.fillRect(0, y, canvas.width, 1);

    drawGraph("CPU", 0, queueCPU, "#999900");
    drawGraph("GPU " + fps + " FPS", height, queueGPU, "#007777");

    // console.log(countersPerFrame[selectedCounterIndex])

    if (countersPerFrame[selectedCounterIndex] && countersPerFrame[selectedCounterIndex].length)
        drawGraph(selectedCounterIndex + "", height * 2, countersPerFrame[selectedCounterIndex], "#aa7700");
}

function createCanvas()
{
    canvas = document.createElement("canvas");
    canvas.id = "performance_";
    canvas.width = numBars;
    canvas.height = height * 3;
    canvas.style.width = numBars + "px";
    canvas.style.height = canvas.height + "px";
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    // canvas.style.opacity = "0.5";
    canvas.style.cursor = "pointer";
    canvas.style.bottom = "0px";
    canvas.style["z-index"] = "10";
    containerEle.appendChild(canvas);
    ctx = canvas.getContext("2d");

    updateCanvas();
    canvas.addEventListener("pointerdown", () =>
    {
        const keys = Object.keys(countersPerFrame);
        selectedCounterIndex = keys[countIndex];
        countIndex++;
        countIndex %= keys.length;
        console.log("text", countIndex, selectedCounterIndex);
    });
}
