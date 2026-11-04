const
    select = op.inDropDown("data", [], "duration cpu"),
    select2 = op.inDropDown("data2", [], "duration cgl gpu"),
    select3 = op.inDropDown("data3", [], "count cgl fps"),
    activeMem = op.inBool("Measure Memory", false),
    activeGPU = op.inBool("Measure GPU", true),
    active = op.inBool("active", true),
    outData = op.outObject("Data"),
    outLog = op.outString("Log Heavy events");

let ctx = null;
let canvas = null;
let numBars = 160;
let height = 50; // height of one graph
const NUM_GRAPHS = 3;
const RESIZE_SIZE = 14;
let resizing = null;
let containerEle = document.body;
let countersPerFrame = {};
let countIndex = 0;
let selectedCounterIndex = "";
let lastHeavyEvent = "";
let toHeavyEvent = 0;
outLog.changeAlways = true;

const pp = op.patch.perfProfiler;

createCanvas();
op.patch.cgl.on("heavyEvent", (e) =>
{
    lastHeavyEvent = e.event + " - " + e.name;
    outLog.set(lastHeavyEvent);
    clearTimeout(toHeavyEvent);
    toHeavyEvent = setTimeout(() => { lastHeavyEvent = ""; }, 1000);

});

const frameListener = op.patch.on("renderedFrame", (e) =>
{
    if (op.patch.cgl) op.patch.cgl.doGlQueryTiming = active.get() && activeGPU.get();

    if (active.get() && !canvas) createCanvas();
    if (!active.get())
    {
        if (canvas) removeCanvas();
        return;
    }

    const cr = e.canvas.getBoundingClientRect();
    canvas.style.top = (cr.top + cr.height - canvas.height) + "px";
    canvas.style.left = cr.left + "px";

    pp.endFrame();

    const keys = Object.keys(pp.durationsFrames).concat(Object.keys(pp.countsFrames));
    select.setUiAttribs({ "values": keys });
    select2.setUiAttribs({ "values": keys });
    select3.setUiAttribs({ "values": keys });

    outData.setRef(pp);
    if (performance.memory && activeMem.get()) op.patch.perfProfiler.count("Memory used", (Math.round((performance.memory.usedJSHeapSize / 1024 / 1024) * 100) / 100));

    updateCanvas();
});

function drawGraph(name, posy, q, col, heavy)
{
    let info = "";
    let k = 0;
    let maxMs = 20;
    if (!q) return;
    if (q[numBars - 1] && q[numBars - 1].num)
    {
        info = q[numBars - 1].num;
        for (k = numBars; k >= 0; k--)
            if (q[k])
                maxMs = Math.max(maxMs, q[k].num * 1);
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
    if (!info && avg)
    {
        avg = (avg / numBars).toPrecision(2);
        info = avg + "ms";
    }

    ctx.globalAlpha = 0.7;

    let str = title;
    if (info) str = info + " " + str;
    if (numBars < 100) str = info;
    ctx.fillText(str, 5, posy + 16);

    if (lastHeavyEvent && title.includes("cgl fps"))
    {
        ctx.fillStyle = "#FF9900";
        ctx.fillText("(!) " + lastHeavyEvent, 5, posy + 34);
    }
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

    if (pp.durationsFrames && pp.durationsFrames[select.get()])
        drawGraph(select.get(), 0, pp.durationsFrames[select.get()], "#999900");
    else if (pp.countsFrames && pp.countsFrames[select.get()])
        drawGraph(select.get(), 0, pp.countsFrames[select.get()], "#999900");

    if (pp.durationsFrames && pp.durationsFrames[select2.get()])
        drawGraph(select2.get(), height, pp.durationsFrames[select2.get()], "#007777");
    else if (pp.countsFrames && pp.countsFrames[select2.get()])
        drawGraph(select2.get(), height, pp.countsFrames[select2.get()], "#007777");

    if (pp.durationsFrames && pp.durationsFrames[select3.get()])
        drawGraph(select3.get(), height * 2, pp.durationsFrames[select3.get()], "#770077");
    else if (pp.countsFrames && pp.countsFrames[select3.get()])
        drawGraph(select3.get(), height * 2, pp.countsFrames[select3.get()], "#555555");

    // resize corner, top right
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(canvas.width - RESIZE_SIZE, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, RESIZE_SIZE);
    ctx.closePath();
    ctx.fill();
}

function setCanvasSize(w, h)
{
    canvas.width = numBars = Math.round(w);
    pp.numframes = numBars; // history length follows the width
    canvas.height = Math.round(h);
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
}

function isInCorner(e)
{
    const r = canvas.getBoundingClientRect();
    return e.clientX > r.right - RESIZE_SIZE && e.clientY < r.top + RESIZE_SIZE;
}

function onPointerDown(e)
{
    if (!isInCorner(e)) return;
    resizing = { "x": e.clientX, "y": e.clientY, "w": canvas.width, "h": canvas.height };
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
}

function onPointerMove(e)
{
    if (!resizing)
    {
        canvas.style.cursor = isInCorner(e) ? "nesw-resize" : "pointer";
        return;
    }
    const w = Math.max(60, Math.min(2000, resizing.w + (e.clientX - resizing.x)));
    const h = Math.max(30 * NUM_GRAPHS, Math.min(1500, resizing.h - (e.clientY - resizing.y)));
    height = Math.round(h / NUM_GRAPHS);
    setCanvasSize(w, height * NUM_GRAPHS);
}

function onPointerUp(e)
{
    if (!resizing) return;
    resizing = null;
    canvas.releasePointerCapture(e.pointerId);
}

function removeCanvas()
{
    if (canvas) canvas.remove();
    canvas = null;
}

op.on("init", () =>
{
    setTimeout(() => { op.refreshParams(); }, 100);
});

op.on("delete", () =>
{
    removeCanvas();
    pp.numframes = 120;
    op.patch.off(frameListener);
});

function createCanvas()
{
    canvas = document.createElement("canvas");
    canvas.id = "performance_";
    canvas.width = numBars;
    canvas.height = height * NUM_GRAPHS;
    pp.numframes = numBars;
    canvas.style.width = numBars + "px";
    canvas.style.height = canvas.height + "px";
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    canvas.style.cursor = "pointer";
    canvas.style.bottom = "0px";
    canvas.style["z-index"] = "10";
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    containerEle.appendChild(canvas);
    canvas.dataset.op = op.id;
    canvas.classList.add("cablesEle");

    ctx = canvas.getContext("2d");

    updateCanvas();
}
