const
    exec = op.inTriggerButton("Open"),
    result = op.outString("Hex"),
    outR = op.outNumber("R"),
    outG = op.outNumber("G"),
    outB = op.outNumber("B"),
    outSupported = op.outBoolNum("Supported", !!window.EyeDropper);

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

exec.onTriggered = () =>
{
    if (!window.EyeDropper)
    {
        op.setUiError("unsupported", "The EyeDropper API is not supported in this browser", 1);
        return;
    }
    op.setUiError("unsupported", null);

    new EyeDropper().open()
        .then((a) =>
        {
            op.setUiError("pick", null);
            result.set(a.sRGBHex);
            outR.set(hexToR(a.sRGBHex) / 255);
            outG.set(hexToG(a.sRGBHex) / 255);
            outB.set(hexToB(a.sRGBHex) / 255);
        })
        .catch((e) =>
        {
            if (e.name == "AbortError") return;
            op.setUiError("pick", "could not pick a color: " + e.message, 1);
        });
};
