const SIZE_MANUAL = "Manual";
const SIZE_MAXIMIZE = "Maximize";
const SIZE_CONTAIN = "Contain";
const ASPECT_RATIOS = ["1:1", "4:3", "3:2", "16:10", "16:9", "21:9", "3:4", "2:3", "9:16"];
const DEFAULT_ASPECT_RATIO = "16:9";
const DEFAULT_MAX_PIXEL_DENSITY = 2;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_STROKE_STYLE = "white";

const canv = document.createElement("canvas");
const
    exec = op.inTriggerButton("Exec"),
    inCanvas = op.inObject("Canvas Copy", null, "element"),
    inSize = op.inSwitch("Size", [SIZE_MANUAL, SIZE_MAXIMIZE, SIZE_CONTAIN], SIZE_MANUAL),
    width = op.inInt("Width", 256),
    height = op.inInt("Height", 256),
    inFixedAspect = op.inBool("Fixed Aspect Ratio", false),
    inAspect = op.inDropDown("Aspect Ratio", ASPECT_RATIOS, DEFAULT_ASPECT_RATIO),
    inHdpi = op.inBool("HDPI", false),
    inMaxDensity = op.inFloat("Max Pixel Density (DPR)", DEFAULT_MAX_PIXEL_DENSITY),
    inClear = op.inBool("Clear", true),
    inR = op.inFloatSlider("r", 0),
    inG = op.inFloatSlider("g", 0),
    inB = op.inFloatSlider("b", 0),
    inA = op.inFloatSlider("a", 1),
    inAddDom = op.inBool("Add to DOM", false),
    next = op.outTrigger("Next"),
    outEle = op.outObject("Element", canv, "element"),
    outWidth = op.outNumber("Canvas Width"),
    outHeight = op.outNumber("Canvas Height"),
    outDensity = op.outNumber("Pixel Density"),
    finished = op.outTrigger("Finished");

inR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Size", [inSize, width, height, inFixedAspect, inAspect]);
op.setPortGroup("Pixel Density", [inHdpi, inMaxDensity]);

const container = op.patch.containerElement || document.body;
let drawWidth = 0;
let drawHeight = 0;
let lastDevicePixelRatio = window.devicePixelRatio;
let layoutChanged = false;

const resizeObserver = new ResizeObserver(() => { layoutChanged = true; });
resizeObserver.observe(container);
let transform = [1, 0, 0, 1, 0, 0];

canv.style.position = "absolute";

const ctx = canv.getContext("2d");
outEle.setRef(canv);

inSize.onChange =
    inClear.onChange =
    inFixedAspect.onChange =
    inHdpi.onChange = updateUi;
inAspect.onChange =
    inMaxDensity.onChange =
    width.onChange =
    height.onChange = updateLayout;
inAddDom.onChange = updateDom;

op.onDelete = () =>
{
    resizeObserver.disconnect();
    removeFromDom();
};

updateUi();
updateDom();

function updateDom()
{
    if (inAddDom.get()) container.appendChild(canv);
    else removeFromDom();
    updateLayout();
}

function removeFromDom()
{
    if (canv.parentNode) canv.parentNode.removeChild(canv);
}

function updateUi()
{
    const maximized = inSize.get() == SIZE_MAXIMIZE;
    width.setUiAttribs({ "greyout": maximized });
    height.setUiAttribs({ "greyout": maximized || inFixedAspect.get() });
    inAspect.setUiAttribs({ "greyout": !inFixedAspect.get() });
    inMaxDensity.setUiAttribs({ "greyout": !inHdpi.get() });
    inR.setUiAttribs({ "greyout": !inClear.get() });
    inG.setUiAttribs({ "greyout": !inClear.get() });
    inB.setUiAttribs({ "greyout": !inClear.get() });
    inA.setUiAttribs({ "greyout": !inClear.get() });
    updateLayout();
}

function getAspectRatio()
{
    const parts = String(inAspect.get()).split(":");
    const ratio = parseFloat(parts[0]) / parseFloat(parts[1]);
    if (!(ratio > 0)) return 1;
    return ratio;
}

function getPixelDensity()
{
    if (!inHdpi.get()) return 1;
    if (inMaxDensity.get() > 0) return Math.min(inMaxDensity.get(), window.devicePixelRatio);
    return window.devicePixelRatio;
}

function fitAspect(availableWidth, availableHeight)
{
    const ratio = getAspectRatio();
    if (availableWidth / availableHeight > ratio) return { "width": availableHeight * ratio, "height": availableHeight };
    return { "width": availableWidth, "height": availableWidth / ratio };
}

function updateLayout()
{
    layoutChanged = false;
    lastDevicePixelRatio = window.devicePixelRatio;
    const rect = container.getBoundingClientRect();

    let w = width.get();
    let h = height.get();
    if (inFixedAspect.get()) h = w / getAspectRatio();

    let shownWidth = w;
    let shownHeight = h;
    let left = 0;
    let top = 0;

    if (inSize.get() == SIZE_MAXIMIZE)
    {
        w = rect.width;
        h = rect.height;
        if (inFixedAspect.get())
        {
            const fitted = fitAspect(rect.width, rect.height);
            w = fitted.width;
            h = fitted.height;
        }
        shownWidth = w;
        shownHeight = h;
    }
    else if (inSize.get() == SIZE_CONTAIN && inAddDom.get() && w > 0 && h > 0)
    {
        const scale = Math.min(rect.width / w, rect.height / h);
        shownWidth = w * scale;
        shownHeight = h * scale;
    }

    w = Math.max(1, Math.round(w));
    h = Math.max(1, Math.round(h));
    if (inSize.get() != SIZE_MANUAL)
    {
        left = (rect.width - shownWidth) / 2;
        top = (rect.height - shownHeight) / 2;
    }

    const density = getPixelDensity();
    const sharpWidth = inHdpi.get() ? shownWidth : w;
    const sharpHeight = inHdpi.get() ? shownHeight : h;
    const pixelWidth = Math.max(1, Math.round(sharpWidth * density));
    const pixelHeight = Math.max(1, Math.round(sharpHeight * density));
    if (canv.width != pixelWidth) canv.width = pixelWidth;
    if (canv.height != pixelHeight) canv.height = pixelHeight;

    drawWidth = w;
    drawHeight = h;
    transform = [pixelWidth / w, 0, 0, pixelHeight / h, 0, 0];

    setCanvasStyle(shownWidth + "px", shownHeight + "px", left + "px", top + "px");

    outWidth.set(drawWidth);
    outHeight.set(drawHeight);
    outDensity.set(transform[0]);
}

function setCanvasStyle(w, h, left, top)
{
    if (canv.style.width != w) canv.style.width = w;
    if (canv.style.height != h) canv.style.height = h;
    if (canv.style.left != left) canv.style.left = left;
    if (canv.style.top != top) canv.style.top = top;
}

exec.onTriggered = () =>
{
    if (layoutChanged || window.devicePixelRatio != lastDevicePixelRatio) updateLayout();

    op.patch.tempData.canvasCompose = { "canvas": canv, "ctx": ctx, "width": drawWidth, "height": drawHeight, "transform": transform };

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (inClear.get())
    {
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.fillStyle = "rgba(" + inR.get() * 255 + "," + inG.get() * 255 + "," + inB.get() * 255 + "," + inA.get() + ")";
        ctx.fillRect(0, 0, canv.width, canv.height);
    }
    if (inCanvas.get() && inCanvas.get().width > 0 && inCanvas.get().height > 0) ctx.drawImage(inCanvas.get(), 0, 0);

    ctx.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
    ctx.fillStyle = "grey";
    ctx.strokeStyle = DEFAULT_STROKE_STYLE;
    ctx.lineWidth = DEFAULT_STROKE_WIDTH;

    next.trigger();
    op.patch.tempData.canvasCompose = null;

    finished.trigger();
};
