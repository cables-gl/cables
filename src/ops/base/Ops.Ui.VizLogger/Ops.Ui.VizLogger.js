const inNum = op.inFloat("Number", 0);
const inString = op.inString("String", "");
const inClear = op.inTriggerButton("Clear");

let lines = 10;
const arr = [];

inNum.changeAlways =
    inString.changeAlways = true;

inClear.onTriggered = () =>
{
    arr.length = 0;
};

inString.onChange = () =>
{
    if (typeof inString.get() == "string")
        arr.push("\"" + inString.get() + "\"");
    else
        arr.push("" + inString.get());
};

inNum.onChange = () =>
{
    arr.push("" + inNum.get());
};

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true, "vizLayerMaxZoom": 2500 });

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    const numChars = (layer.width / layer.scale / 6 - 1);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    if (lines > 0) while (arr.length - 1 > lines) arr.shift();

    lines = Math.floor(layer.height / layer.scale / 10 - 1);
    let padding = 4;

    ctx.fillStyle = "#ccc";

    for (let i = Math.min(lines, arr.length - 1); i >= 0; i--)
    {
        if (arr[i].length > numChars)arr[i] = arr[i].substr(0, numChars);
        ctx.fillText(arr[i], layer.x / layer.scale + padding, layer.y / layer.scale + 10 * i + padding * 2);
    }

    ctx.restore();
};
