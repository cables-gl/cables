const inString = op.inString("String", "");
const inNum = op.inFloat("Number", 0);
const inObject = op.inObject("Object", "");
const inClear = op.inTriggerButton("Clear");

let lines = 10;
const arr = [];
const arrTimes = [];
const arrColors = [];

inNum.changeAlways =
    inString.changeAlways = true;

inClear.onTriggered = () =>
{
    arr.length = 0;
    arrTimes.length = 0;
    arrColors.length = 0;
};

function addLine(str,color="#ccc"){

arr.push(str)
arrColors.push(color)
    arrTimes.push( new Date().toTimeString().substring(0, 8))
  }

inString.onChange = () =>
{
    if (!CABLES.UI)return
    if(!inString.isLinked()) return;

    if (typeof inString.get() == "string")
        addLine( inString.get() );
    else
        addLine(String( inString.get()));
};

inObject.onChange = () =>
{
    if (!CABLES.UI)return
    if(!inString.isLinked()) return;
        addLine(String(inObject.get()),"#cc0");
};

inNum.onChange = () =>
{

    if (!CABLES.UI)return
    if(!inString.isLinked()) return
        addLine(String( inNum.get()),"#0cc");
};

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true, "vizLayerMaxZoom": 3500 });

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y, layer.width, layer.height);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    const numChars = (layer.width / layer.scale / 6 - 1);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    if (lines > 0)
        while (arr.length - 1 > lines*3) arr.shift();

    lines = Math.floor(layer.height / layer.scale / 10 - 1);
    let padding = 4;

    for (let i = Math.min(lines, arr.length - 1); i >= 0; i--)
    {
        ctx.fillStyle = "#888";
        ctx.fillText(arrTimes[i], layer.x / layer.scale + padding, layer.y / layer.scale + 10 * i + padding * 2);

        ctx.fillStyle = arrColors[i];
        if (arr[i].length > numChars) arr[i] = arr[i].substr(0, numChars);
        ctx.fillText("         " +arr[i], layer.x / layer.scale + padding, layer.y / layer.scale + 10 * i + padding * 2);
    }

    ctx.restore();
};
