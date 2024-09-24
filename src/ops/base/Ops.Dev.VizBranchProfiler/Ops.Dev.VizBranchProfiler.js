const
    inObj = op.inObject("Profiler Data"),

    inRender = op.inSwitch("Render", ["Patch", "Canvas", "Both"], "Patch"),
    inWidth = op.inInt("Width", 500),
    inHeight = op.inInt("Height", 200),
    expEle = op.inBool("Expand elements", true),
    outCanvas = op.outObject("Canvas", null, "element"),
    outTotalDur = op.outNumber("Duration"),
    inUpdate = op.inTriggerButton("Update");

op.setUiAttrib({ "height": 100, "width": 500, "resizable": true });

op.setPortGroup("Canvas", [inWidth, inHeight]);

// const colors = ["#D183BF", "#9091D6", "#FFC395", "#F0D165", "#63A8E8", "#CF5D9D", "#66C984", "#D66AA6", "#515151", "#7AC4E0"];
// const colors = ["#DDDDDD","#CCCCCC" ,"#BBBBBB" ];
const colors = ["#666666", "#444444", "#555555"];

let colorCycle = 0;
let totalDur = 1;
let root = null;
let doUpdate = true;
let canvas = null;
let render2Canvas = false;
let canvasWidth = 0;
let canvasHeight = 0;

inRender.onChange = updateUi;
inHeight.onChange = inWidth.onChange = setupCanvas;

function setupCanvas()
{
    if (render2Canvas && (!canvas || canvasHeight != inHeight.get() || canvasWidth != inWidth.get()))
    {
        if (canvas)canvas.remove();
        canvas = document.createElement("canvas");

        canvasWidth = inWidth.get();
        canvasHeight = inHeight.get();
        canvas.setAttribute("width", canvasWidth);
        canvas.setAttribute("height", canvasHeight);
    }
}

function updateUi()
{
    render2Canvas = inRender.get() != "Patch";

    inWidth.setUiAttribs({ "greyout": !render2Canvas });
    inHeight.setUiAttribs({ "greyout": !render2Canvas });

    setupCanvas();
}

function getWidth(layer, d)
{
    // d = Math.max(0.01, d);
    if (d < 0.2) d = 0.004;
    // return Math.max(layer.width * (0.01 / totalDur), layer.width * (d / totalDur));
    // return layer.width * (d / totalDur);
    return layer.width * (d / totalDur);
}

inUpdate.onTriggered = () =>
{
    doUpdate = true;

    if (render2Canvas && inObj.get() && inObj.get().root)
    {
        const layer = { "width": inWidth.get(), "height": inHeight.get(), "x": 0, "y": 0 };
        const ctx = canvas.getContext("2d");

        totalDur = inObj.get().root.dur;
        // console.log(inObj.get());
        // console.log(inObj.get().root.dur)
        clear(ctx, layer);
        drawBranch(ctx, layer, inObj.get().root, 0, 0);
        outCanvas.set(null);
        outCanvas.set(canvas);
    }

    outTotalDur.set(totalDur);
};

function clear(ctx, layer)
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);
}

function drawBranch(ctx, layer, b, level, posx, branchDur, branchWidth)
{
    if (!b) return;

    colorCycle++;
    colorCycle %= (colors.length);

    let rowHeight = (layer.height / 10);
    let posy = rowHeight * level;

    let w = getWidth(layer, b.dur);
    if (expEle.get()) w = branchWidth;

    ctx.fillStyle = colors[colorCycle];
    ctx.fillRect(
        layer.x + posx, posy + layer.y,
        w, rowHeight);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(
        layer.x + posx, posy + layer.y,
        w, rowHeight);
    ctx.stroke();

    let fontSize = 24;
    ctx.fillStyle = "#f0d164";
    ctx.font = "bold " + fontSize + "px sourceCodePro";

    let durs = Math.round(b.dur * 100) / 100 + "ms";

    let nBranchDur = 0;
    for (let i = 0; i < b.childs.length; i++)
        nBranchDur += b.childs[i].dur;

    let padd = 7;

    ctx.fillText(b.name, layer.x + posx + padd + 5, layer.y + posy + fontSize + padd);
    // ctx.fillText(durs, layer.x + posx + padd, layer.y + posy + fontSize + fontSize * 1.2 + padd);
    if (b.txt)
    {
        ctx.fillStyle = "#ccc";
        ctx.font = "normal " + 21 + "px sourceCodePro";

        for (let i = 0; i < b.txt.length; i++)
            ctx.fillText(b.txt[i], layer.x + posx + padd + 15, layer.y + posy + fontSize + fontSize * (i + 1) * 1.3 + padd);
    }

    // if (nBranchDur)ctx.fillText("child durs " + Math.round(nBranchDur / b.dur * 100) + "%", layer.x + posx + padd, layer.y + posy + fontSize + fontSize + fontSize * 1.2 + padd);

    let xadd = 0;

    for (let i = 0; i < b.childs.length; i++)
    {
        drawBranch(ctx, layer, b.childs[i], level + 1, posx + xadd, w, branchWidth / b.childs.length);

        if (expEle.get()) xadd += branchWidth / b.childs.length;
        else xadd += getWidth(layer, b.childs[i].dur);
    }
}

op.renderVizLayer = (ctx, layer) =>
{
    if (!inObj.get() || !inObj.get().root) return;
    clear(ctx, layer);

    colorCycle = 0;

    if (doUpdate)
    {
        doUpdate = false;
        totalDur = inObj.get().root.dur;
        root = inObj.get().root;
    }

    drawBranch(ctx, layer, root, 0, 0, 0, layer.width);
};
