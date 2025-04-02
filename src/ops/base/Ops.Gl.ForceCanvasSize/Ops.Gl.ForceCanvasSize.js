const
    inTrigger = op.inTrigger("Trigger"),
    inActive = op.inBool("Active", true),
    inWhat = op.inSwitch("Force", ["Resolution", "Aspect Ratio"], "Resolution"),
    inCenter = op.inBool("Center In Parent", true),
    inScaleFit = op.inBool("Scale to fit Parent", true),
    inWidth = op.inInt("Set Width", 300),
    inHeight = op.inInt("Set Height", 200),
    inPresets = op.inDropDown("Aspect Ratio", ["Custom", "21:9", "2:1", "16:9", "16:10", "4:3", "1:1", "9:16", "1:2", "iPhoneXr Vert"], "16:9"),
    inRatio = op.inFloat("Ratio", 0),
    inStretch = op.inDropDown("Fill Parent", ["Auto", "Width", "Height", "Both"], "Auto"),
    next = op.outTrigger("Next"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outMarginLeft = op.outNumber("Margin Left"),
    outMarginTop = op.outNumber("Margin Top");

op.setPortGroup("Size", [inWidth, inHeight]);
op.setPortGroup("Proportions", [inRatio, inStretch, inPresets]);

let align = 0;
const ALIGN_NONE = 0;
const ALIGN_WIDTH = 1;
const ALIGN_HEIGHT = 2;
const ALIGN_BOTH = 3;
const ALIGN_AUTO = 4;

inStretch.onChange = updateUi;
inWhat.onChange = updateMethod;
inCenter.onChange =
    inTrigger.onLinkChanged = removeStyles;

inPresets.onChange = updateRatioPreset;

const cgl = op.patch.cgl;

// if (window.getComputedStyle(cgl.canvas).position === "absolute")
// {
//     cgl.canvas.style.position = "initial";
//     op.warn("[cables forceCanvasSize] - canvas was positioned absolute, not compatible with Ops.Gl.ForceCanvasSize");
// }

updateUi();

function updateMethod()
{
    if (inWhat.get() == "Aspect Ratio")
    {
        inRatio.set(100);
        updateRatioPreset();
    }
    updateUi();
}

function updateRatioPreset()
{
    const pr = inPresets.get();
    if (pr == "Custom") return;
    else if (pr == "16:9")inRatio.set(16 / 9);
    else if (pr == "4:3")inRatio.set(4 / 3);
    else if (pr == "16:10")inRatio.set(16 / 10);
    else if (pr == "21:9")inRatio.set(21 / 9);
    else if (pr == "2:1")inRatio.set(2);
    else if (pr == "1:1")inRatio.set(1);
    else if (pr == "9:16")inRatio.set(9 / 16);
    else if (pr == "1:2")inRatio.set(0.5);
    else if (pr == "iPhoneXr Vert")inRatio.set(9 / 19.5);
}

op.on("delete", () =>
{
    removeStyles();
});

inRatio.onChange = () =>
{
    removeStyles();
};

inActive.onChange = function ()
{
    if (!inActive.get())removeStyles();
};

function updateUi()
{
    const forceRes = inWhat.get() == "Resolution";
    inWidth.setUiAttribs({ "greyout": !forceRes });
    inHeight.setUiAttribs({ "greyout": !forceRes });

    inPresets.setUiAttribs({ "greyout": forceRes });
    inStretch.setUiAttribs({ "greyout": forceRes });
    inRatio.setUiAttribs({ "greyout": forceRes });

    align = 0;

    if (!forceRes)
    {
        const strAlign = inStretch.get();
        if (strAlign == "Width")align = ALIGN_WIDTH;
        else if (strAlign == "Height")align = ALIGN_HEIGHT;
        else if (strAlign == "Both")align = ALIGN_BOTH;
        else if (strAlign == "Auto")align = ALIGN_AUTO;
    }
}

function removeStyles()
{
    cgl.canvas.style["margin-top"] = "";
    cgl.canvas.style["margin-left"] = "";
    cgl.canvas.styleMarginLeft = 0;
    cgl.canvas.styleMarginTop = 0;

    outMarginLeft.set(0);
    outMarginTop.set(0);

    const rect = cgl.canvas.parentNode.getBoundingClientRect();

    cgl.setSize(rect.width, rect.height);

    cgl.canvas.style.transform = "scale(1)";

    cgl.canvas.style.position = "absolute";

    cgl.updateSize();
}

inTrigger.onTriggered = function ()
{
    if (!inActive.get()) return next.trigger();

    let w = inWidth.get();
    let h = inHeight.get();

    let clientRect = cgl.canvas.parentNode.getBoundingClientRect();

    // console.log("clientrect",clientRect);

    if (clientRect.height == 0)
    {
        cgl.canvas.parentNode.style.height = "100%";
        clientRect = cgl.canvas.parentNode.getBoundingClientRect();
    }
    if (clientRect.width == 0)
    {
        cgl.canvas.parentNode.style.width = "100%";
        clientRect = cgl.canvas.parentNode.getBoundingClientRect();
    }

    if (align == ALIGN_WIDTH)
    {
        w = clientRect.width;
        h = w * 1 / inRatio.get();
    }
    else if (align == ALIGN_HEIGHT)
    {
        h = clientRect.height;
        w = h * inRatio.get();
    }
    else if (align == ALIGN_AUTO)
    {
        const rect = clientRect;

        h = rect.height;
        w = h * inRatio.get();

        if (w > rect.width)
        {
            w = rect.width;
            h = w * 1 / inRatio.get();
        }
    }
    else if (align == ALIGN_BOTH)
    {
        const rect = clientRect;
        h = rect.height;
        w = h * inRatio.get();

        if (w < rect.width)
        {
            w = rect.width;
            h = w * 1 / inRatio.get();
        }
    }

    w = Math.ceil(w);
    h = Math.ceil(h);

    if (inCenter.get())
    {
        const rect = clientRect;

        const t = (rect.height - h) / 2;
        const l = (rect.width - w) / 2;

        outMarginLeft.set(l);
        outMarginTop.set(t);

        cgl.canvas.style["margin-top"] = t + "px";
        cgl.canvas.style["margin-left"] = l + "px";
        cgl.canvas.styleMarginTop = t;
        cgl.canvas.styleMarginLeft = l;
    }
    else
    {
        cgl.canvas.style["margin-top"] = "0";
        cgl.canvas.style["margin-left"] = "0";
        cgl.canvas.styleMarginTop = 0;
        cgl.canvas.styleMarginLeft = 0;

        outMarginLeft.set(0);
        outMarginTop.set(0);
    }

    if (inScaleFit.get())
    {
        const rect = clientRect;
        const scX = rect.width / inWidth.get();
        const scY = rect.height / inHeight.get();
        cgl.canvas.style.transform = "scale(" + Math.min(scX, scY) + ")";
    }
    else
    {
        cgl.canvas.style.transform = "scale(1)";
    }

    if (cgl.canvasWidth != w || cgl.canvasHeight != h)
    {
        outWidth.set(w);
        outHeight.set(h);
        cgl.setSize(w, h);
    }
    // else
    next.trigger();
};
