const
    select = op.inDropDown("data", [], "cpu"),
    select2 = op.inDropDown("data2", [], "gpu_gl"),
    select3 = op.inDropDown("data3", [], "fps"),
    activeMem = op.inBool("Measure Memory", false),
    activeGPU = op.inBool("Measure GPU", true),
    active = op.inBool("active", true);

let ctx = null;
let canvas = null;
let numBars = 120;
let height = 50;
let containerEle = document.body;
let countersPerFrame = {};
let countIndex = 0;
let selectedCounterIndex = "";

const pp = op.patch.perfProfiler;

createCanvas();

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

    if (activeMem.get()) op.patch.perfProfiler.count("Memory used", (Math.round((performance.memory.usedJSHeapSize / 1024 / 1024) * 100) / 100));

    updateCanvas();
});

function drawGraph(name, posy, q, col)
{
    let info = "";
    let k = 0;
    let maxMs = 25;
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
}

function removeCanvas()
{
    if (canvas) canvas.remove();
    canvas = null;
}

op.on("delete", () =>
{
    removeCanvas();
    op.patch.off(frameListener);
});

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
    canvas.style.cursor = "pointer";
    canvas.style.bottom = "0px";
    canvas.style["z-index"] = "10";
    containerEle.appendChild(canvas);
    canvas.dataset.op = op.id;
    canvas.classList.add("cablesEle");

    ctx = canvas.getContext("2d");

    updateCanvas();
    canvas.addEventListener("pointerdown", () =>
    {
        const keys = Object.keys(countersPerFrame);
        selectedCounterIndex = keys[countIndex];
        countIndex++;
        countIndex %= keys.length;
    });
}
