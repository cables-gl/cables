const inString = op.inString("String", "");
const inNum = op.inFloat("Number", 0);
const inObject = op.inObject("Object", "");
const inClear = op.inTriggerButton("Clear");

const COL_TIME = "#888";

function themeColor(name, fallback)
{
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
const COL_STRING = themeColor("--color_port_string", "#d57272");
const COL_NUMBER = themeColor("--color_port_number", "#5CB59E");
const COL_OPNAME = themeColor("--color_port_function", "#F0D165");
const CHAR_WIDTH = 6;
const TIME_CHARS = 9;

// quoted text | op names | numbers
const tokenRegex = /("[^"]*"|'[^']*')|(\bOps\.[\w.]+)|(-?\b\d+(?:\.\d+)?\b)/g;

let lines = 10;
const arr = [];

inNum.changeAlways =
    inString.changeAlways = true;

inClear.onTriggered = () =>
{
    arr.length = 0;
};

// splits a line into colored parts once, so rendering does not need to parse it every frame
function tokenize(str, color)
{
    const parts = [];
    let last = 0;
    for (const m of str.matchAll(tokenRegex))
    {
        if (m.index > last) parts.push({ "text": str.substring(last, m.index), "color": color });
        parts.push({ "text": m[0], "color": m[1] ? COL_STRING : m[2] ? COL_OPNAME : COL_NUMBER });
        last = m.index + m[0].length;
    }
    if (last < str.length) parts.push({ "text": str.substring(last), "color": color });
    return parts;
}

function addLine(str, color = "#ddd", highlight = true)
{
    arr.push({
        "time": new Date().toTimeString().substring(0, 8),
        "parts": highlight ? tokenize(str, color) : [{ "text": str, "color": color }]
    });
}

inString.onChange = () =>
{
    if (!CABLES.UI) return;
    if (!inString.isLinked()) return;

    addLine(String(inString.get()));
};

inObject.onChange = () =>
{
    if (!CABLES.UI) return;
    if (!inObject.isLinked()) return;
    addLine(String(inObject.get()), "#cc0", false);
};

inNum.onChange = () =>
{
    if (!CABLES.UI) return;
    if (!inNum.isLinked()) return;
    addLine(String(inNum.get()), "#0cc", false);
};

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true, "vizLayerMaxZoom": 3500 });

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y, layer.width, layer.height);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    const numChars = (layer.width / layer.scale / CHAR_WIDTH - 1);

    ctx.font = "normal 10px sourceCodePro";

    if (lines > 0)
        while (arr.length - 1 > lines * 3) arr.shift();

    lines = Math.floor(layer.height / layer.scale / 10 - 1);
    let padding = 4;

    for (let i = Math.min(lines, arr.length - 1); i >= 0; i--)
    {
        const y = layer.y / layer.scale + 10 * i + padding * 2;
        let x = layer.x / layer.scale + padding;

        ctx.fillStyle = COL_TIME;
        ctx.fillText(arr[i].time, x, y);
        x += TIME_CHARS * CHAR_WIDTH;

        let chars = TIME_CHARS;
        for (const part of arr[i].parts)
        {
            if (chars >= numChars) break;
            const text = part.text.substring(0, numChars - chars);

            ctx.fillStyle = part.color;
            ctx.fillText(text, x, y);

            x += text.length * CHAR_WIDTH;
            chars += text.length;
        }
    }

    ctx.restore();
};
