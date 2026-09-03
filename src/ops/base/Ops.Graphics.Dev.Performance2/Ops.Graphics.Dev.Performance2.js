const
    trig = op.inTrigger("trigger"),
    next = op.outTrigger("next");

let ctx = null;
let canvas = null;
let numBars = 100;
let height = 30;
let containerEle = document.body;
let queueCPU = [];
let queueGPU = [];
createCanvas();
let type = null;

let glExt = null;
let cgl = null;
let query = null;
let glqueryagain = 0;
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

    updateCanvas();
});

op.on("delete", () =>
{
    canvas.remove();
    op.patch.off(frameListener);
});

function drawGraph(posy, q, col)
{
    ctx.fillStyle = col;
    let k = 0;
    // numBars = Math.max(0, numBars);
    let hmul = height / 24;
    if (q.length == 0)
        for (let i = 0; i < numBars; i++) q.push({ "ms": 0 });

    for (k = numBars; k >= 0; k--)
    {
        if (q[k])
        {
            const itemHeight = (q[k].ms * hmul);
            ctx.fillRect(numBars - k, posy + height - itemHeight, 1, itemHeight); // Math.min(1, q[k].ms * hmul));
        }
    }

}

function updateCanvas()
{
    // const height = canvas.height;
    // const hmul = inScaleGraph.get();

    const colorBg = "#555555";

    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, height + 1, canvas.width, 1);

    drawGraph(0, queueCPU, "#FFFFFF");
    drawGraph(height, queueGPU, "#FFFF00");
    // console.log("q",queueGPU);

    // for (k = numBars; k >= 0; k--)
    // {
    //     let sum = 0;
    //     ctx.fillStyle = colorMainloop;
    //     sum = timesMainloop[k];
    //     ctx.fillRect(numBars - k, height - sum * hmul, 1, timesMainloop[k] * hmul);

    //     ctx.fillStyle = colorOnFrame;
    //     sum += timesOnFrame[k];
    //     ctx.fillRect(numBars - k, height - sum * hmul, 1, timesOnFrame[k] * hmul);

    //     ctx.fillStyle = colorGPU;
    //     sum += timesGPU[k];
    //     ctx.fillRect(numBars - k, height - sum * hmul, 1, timesGPU[k] * hmul);
    // }

    // for (let i = 10; i < height; i += 10)
    // {
    //     ctx.fillStyle = "#888";
    //     const y = height - (i * hmul);
    //     ctx.fillRect(canvas.width - 5, y, 5, 1);
    //     ctx.font = "8px arial";

    //     ctx.fillText(i + "ms", canvas.width - 27, y + 3);
    // }

    // ctx.fillStyle = "#fff";
    // ctx.fillRect(canvas.width - 5, height - (1000 / fps * hmul), 5, 1);
    // ctx.fillText(Math.round(1000 / fps) + "ms", canvas.width - 27, height - (1000 / fps * hmul));
}

function createCanvas()
{
    canvas = document.createElement("canvas");
    canvas.id = "performance_";
    canvas.width = numBars;
    canvas.height = height * 2;
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
