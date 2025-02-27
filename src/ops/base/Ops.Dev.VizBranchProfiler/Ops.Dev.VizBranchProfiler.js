const
    inObj = op.inObject("Profiler Data"),
    inRender = op.inSwitch("Render", ["Patch", "Canvas", "Both"], "Patch"),
    inWidth = op.inInt("Width", 500),
    inHeight = op.inInt("Height", 200),
    expEle = op.inBool("Expand elements", true),
    inUpdate = op.inTriggerButton("Update"),
    outCanvas = op.outObject("Canvas", null, "element"),
    outTotalDur = op.outNumber("Duration"),
    outInfo = op.outObject("Data");

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
let pixelDensity = 1;
let fontMultiply = 1;
let hovering = false;
let mulY = 1;
let maxPosy = 0;
let padd = 7;
let clicked = {};

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

inUpdate.onTriggered = () =>
{
    doUpdate = true;

    if (render2Canvas)
    {
        const layer = { "width": inWidth.get(), "height": inHeight.get(), "x": 0, "y": 0 };
        const ctx = canvas.getContext("2d");
        clear(ctx, layer);

        if (inObj.get() && inObj.get().root)
        {
            totalDur = inObj.get().root.dur;
            drawBranch(ctx, layer, inObj.get().root, 0, 0);
            outCanvas.setRef(canvas);
        }
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

function drawElement()
{

}

function getWidth(layer, d)
{
    // d = Math.max(0.01, d);
    if (d < 0.1) d = 0.1;
    // return Math.max(layer.width * (0.01 / totalDur), layer.width * (d / totalDur));
    // return layer.width * (d / totalDur);
    return layer.width * (d / totalDur) / pixelDensity;
}

function drawEle(b, ctx, layer, x, y, posx, posy)
{
}

let hoverX = 0;
let hoverY = 0;
let hoverW = 0;
let hoverH = 0;

function itemHeight(b)
{
    let lines = 1;
    // if (b.txt)lines += b.txt.length;
    let rowHeight = ((lines + 1) * 14) * pixelDensity + padd + padd;
    return rowHeight;
}

function drawBranch(ctx, layer, b, level, posx, posy, branchDur, branchWidth, viewBox, mouseState)
{
    if (!b) return;

    colorCycle++;

    // let lines = 1;
    let rowHeight = itemHeight(b) * mulY;// ((lines + 1) * 14) * pixelDensity + padd + padd+(mulY);
    let hoverele = null;
    let hover = false;
    let w = getWidth(layer, b.dur) * 0.25;
    if (expEle.get()) w = branchWidth;

    if (viewBox.mouseX * pixelDensity > layer.x + posx &&
        viewBox.mouseX * pixelDensity < layer.x + posx + w &&
        viewBox.mouseY * pixelDensity > layer.y + posy &&
        viewBox.mouseY * pixelDensity < layer.y + posy + rowHeight)
    {
        if (mouseState.getButton() == 1)
        {
            hoverX = layer.x + posx;
            hoverY = layer.y + posy;
            clicked = { "count": colorCycle, "task": b.task, "name": String(b.name) };
        }
    }

    // if (clicked &&
    //     clicked.x ==posx &&
    //     clicked.y ==posy)
    if (clicked && String(b.name) == clicked.name && b.task == clicked.task && colorCycle == clicked.count)
    {
        hoverele = b;
        hover = true;
        hovering = b;

        outInfo.setRef(
            {
                "task": b.task,
                "name": b.name,
                "duration": b.dur,
                "data": b.data
            });
    }

    let region = new Path2D();
    region.rect(layer.x + posx, posy + layer.y, w, rowHeight);
    ctx.save();
    ctx.clip(region);

    if (hovering && hovering != b)
    {
        region.rect(hoverX, hoverY, w, rowHeight);
        ctx.clip(region, "evenodd");
    }

    ctx.fillStyle = colors[colorCycle % colors.length];
    ctx.fillRect(
        layer.x + posx, posy + layer.y,
        w, rowHeight);

    let fontSize = 12 * pixelDensity * fontMultiply;
    ctx.fillStyle = "#f0d164";
    ctx.font = "bold " + fontSize + "px sourceCodePro";

    let durs = Math.round(b.dur * 100) / 100 + "ms";

    let nBranchDur = 0;
    for (let i = 0; i < b.childs.length; i++)
        nBranchDur += b.childs[i].dur;

    ctx.fillText(b.task, layer.x + posx + padd + 5, layer.y + posy + fontSize + padd);
    // ctx.fillText(durs, layer.x + posx + padd, layer.y + posy + fontSize + fontSize * 1.2 + padd);
    if (b.name)
    {
        ctx.fillStyle = "#ccc";
        ctx.font = "normal " + 12 * fontMultiply * pixelDensity + "px sourceCodePro";

        if (typeof b.name == "string")
            ctx.fillText(b.name, layer.x + posx + padd + 5, layer.y + posy + fontSize + fontSize * (1) * 1.3 + padd);
    }

    // outline
    if (hover)ctx.strokeStyle = "#ffffff";
    else ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(
        layer.x + posx, posy + layer.y,
        w, rowHeight);
    ctx.stroke();

    ctx.restore();

    let xadd = 0;

    for (let i = 0; i < b.childs.length; i++)
    {
        drawBranch(ctx, layer, b.childs[i], level + 1, posx + xadd, posy + rowHeight, w, branchWidth / b.childs.length, viewBox, mouseState);

        if (expEle.get()) xadd += branchWidth / b.childs.length;
        else xadd += getWidth(layer, b.childs[i].dur);
    }
}

function calcHeight(b, posy)
{
    let rowHeight = itemHeight(b);

    maxPosy = Math.max(posy, maxPosy);

    for (let i = 0; i < b.childs.length; i++)
    {
        calcHeight(b.childs[i], posy + rowHeight);
    }
}

op.renderVizLayer = (ctx, layer, viz) =>
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

    hovering = false;
    pixelDensity = layer.pixelDensity;
    maxPosy = 0;

    calcHeight(root, 0);

    mulY = (layer.height + 20) / maxPosy / 1.5; // why these magic numbers

    drawBranch(ctx, layer, root, 0, 0, 0, 0, layer.width, viz._glPatch.viewBox, viz._glPatch.mouseState);
};
