const
    inObj = op.inObject("Profiler Data"),
    inUpdate = op.inTriggerButton("Update");

op.setUiAttrib({ "height": 100, "width": 500, "resizable": true });

const colors = ["#D183BF", "#9091D6", "#FFC395", "#F0D165", "#63A8E8", "#CF5D9D", "#66C984", "#D66AA6", "#515151", "#7AC4E0"];

let colorCycle = 0;
let totalDur = 1;
let root = null;
let doUpdate = true;

function getWidth(layer, d)
{
    if (d < 0.2) d = 0.004;

    return layer.width * (d / totalDur);
}

inUpdate.onTriggered = () =>
{
    doUpdate = true;
};

function drawBranch(ctx, layer, b, level, posx)
{
    if (!b) return;

    // colorCycle=((colorCycle||1));
    colorCycle++;
    colorCycle %= (colors.length - 1);

    let rowHeight = (layer.height / 10);
    let posy = rowHeight * level;

    ctx.fillStyle = colors[colorCycle];
    ctx.fillRect(
        layer.x + posx, posy + layer.y,
        getWidth(layer, b.dur), rowHeight);

    let fontSize = 18;
    ctx.fillStyle = "#222";
    ctx.font = "normal " + fontSize + "px sourceCodePro";

    let durs = "(" + Math.round(b.dur * 100) / 100 + "ms)";
    if (b.dur < 0.2)durs = "";
    ctx.fillText(b.name + durs, layer.x + posx, layer.y + posy + fontSize);

    let xadd = 0;
    for (let i = 0; i < b.childs.length; i++)
    {
        drawBranch(ctx, layer, b.childs[i], level + 1, posx + xadd);
        xadd += getWidth(layer, b.childs[i].dur);
    }
}

op.renderVizLayer = (ctx, layer) =>
{
    if (!inObj.get().root) return;
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    colorCycle = 0;

    // console.log(totalDur);
    if (doUpdate)
    {
        doUpdate = false;
        totalDur = inObj.get().root.dur;
        root = inObj.get().root;
        // console.log(root);
    }

    drawBranch(ctx, layer, root, 0, 0);
};
