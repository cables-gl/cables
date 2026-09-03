const
    trig = op.inTrigger("trigger"),
    next = op.outTrigger("next");

let ctx = null;
let canvas = null;
let numBars = 100;
let height = 40;
let containerEle = document.body;
let queueCPU = [];
let queueGPU = [];
let queueEvents = [];
createCanvas();
let type = null;

let glExt = null;
let cgl = null;
let query = null;
let glqueryagain = 0;
let heavyEvents = [];

if (op.patch.cgl)
{

    op.patch.cgl.on("heavyEvent", (e) =>
    {
        heavyEvents.push(e.event);
    });
}

trig.onTriggered = () =>
{

    const startTime = performance.now();

    if (type == "webgl" && !query)
    {
        cgl = op.patch.cgl;
        if (!glExt) glExt = cgl.gl.getExtension("EXT_disjoint_timer_query_webgl2");
        if (glExt)
        {
            query = cgl.gl.createQuery();
            cgl.gl.beginQuery(glExt.TIME_ELAPSED_EXT, query);
        }
        else console.log("no");
    }

    next.trigger();
    queueCPU.push({ "ms": performance.now() - startTime });
    queueCPU.shift();

    if (type == "webgl" && glExt && query != null)
    {
        cgl.gl.endQuery(glExt.TIME_ELAPSED_EXT);
    }
    // console.log("per",queueCPU[0].ms );
};

const frameListener = op.patch.on("renderedFrame", (e) =>
{
    // queue.push({ "ms": e.ms });
    // queue.shift();
    if (cgl && query)
    {

        const available = cgl.gl.getQueryParameter(query, cgl.gl.QUERY_RESULT_AVAILABLE);
        const disjoint = cgl.gl.getParameter(glExt.GPU_DISJOINT_EXT);

        if (available && !disjoint)
        {
            const gpuTimeNs = cgl.gl.getQueryParameter(query, cgl.gl.QUERY_RESULT);
            const gpuTimeMs = gpuTimeNs / 1000000;

            queueGPU.push({ "ms": gpuTimeMs });
            queueGPU.shift();

            query = null;
        }
        else
        {
            // console.log("not available");
            glqueryagain++;
            if (glqueryagain > 100)
            {
                query = null;
                glqueryagain = 0;
            }
        }

    }
    type = e.type;
    const cr = e.canvas.getBoundingClientRect();
    // console.log("cr",cr c);
    canvas.style.top = (cr.top + cr.height - canvas.height) + "px";
    canvas.style.left = cr.left + "px";

    queueEvents.push({ "num": heavyEvents.length, "name": heavyEvents.join(",") });
    queueEvents.shift();
    heavyEvents = [];

    updateCanvas();
});

op.on("delete", () =>
{
    canvas.remove();
    op.patch.off(frameListener);
});

function drawGraph(name, posy, q, col)
{
    let k = 0;
    let maxMs = 25;
    let hmul = height / maxMs;
    if (q.length == 0)
        for (let i = 0; i < numBars; i++) q.push({ "ms": 0 });

    let avg = 0;
    let info = "";
    for (k = numBars; k >= 0; k--)
    {
        if (q[k])
        {
            const itemHeight = Math.min(maxMs, ((q[k].ms || q[k].num * 3 || 0) * hmul));
            if (itemHeight == maxMs) ctx.fillStyle = "#ff0000";
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

    ctx.fillText(title, 5, posy + 16);
    if (info) ctx.fillText(info, 5, posy + 32);
}

function updateCanvas()
{
    const colorBg = "#333333";

    ctx.font = "11px monospace";

    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#555555";
    for (let y = height; y < canvas.height; y += height)
        ctx.fillRect(0, y, canvas.width, 1);

    drawGraph("CPU", 0, queueCPU, "#999900");
    drawGraph("GPU", height, queueGPU, "#007777");
    drawGraph("EVENTS", height * 2, queueEvents, "#aa7700");
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
    canvas.style.cursor = "pointer";
    canvas.style.bottom = "0px";
    canvas.style["z-index"] = "99998";
    containerEle.appendChild(canvas);
    ctx = canvas.getContext("2d");
    updateCanvas();
}
