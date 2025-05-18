const
    hex = op.inString("Hex", "#ff0000"),
    asBytes = op.inValueBool("Bytes"),
    outR = op.outNumber("R"),
    outG = op.outNumber("G"),
    outB = op.outNumber("B"),
    outArr = op.outArray("RGB Array");

function hexToR(h)
{
    return parseInt((cutHex(h)).substring(0, 2), 16) || 0;
}

function hexToG(h)
{
    return parseInt((cutHex(h)).substring(2, 4), 16) || 0;
}

function hexToB(h)
{
    return parseInt((cutHex(h)).substring(4, 6), 16) || 0;
}

function cutHex(h = "")
{
    return (h.charAt(0) == "#") ? h.substring(1, 7) : h;
}

hex.onChange = parse;
asBytes.onChange = parse;

function parse()
{
    let str = hex.get() || "";
    let r = hexToR(str);
    let g = hexToG(str);
    let b = hexToB(str);

    if (!asBytes.get())
    {
        r /= 255;
        g /= 255;
        b /= 255;
    }

    outR.set(r);
    outB.set(b);
    outG.set(g);
    outArr.set([r, g, b]);
}
