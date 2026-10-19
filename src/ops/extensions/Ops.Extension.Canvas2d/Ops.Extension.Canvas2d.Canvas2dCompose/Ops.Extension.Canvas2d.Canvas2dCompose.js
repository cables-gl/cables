const canv = document.createElement("canvas");
const
    exec = op.inTrigger("Exec"),
    inCanvas = op.inObject("Canvas Copy", null, "element"),
    inSize = op.inSwitch("Size", ["Manual", "Maximize", "Contain"], "Manual"),
    width = op.inInt("Width", 256),
    height = op.inInt("Height", 256),
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
    finished = op.outTrigger("Finished");

inR.setUiAttribs({ "colorPick": true });

const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_STROKE_STYLE = "white";

const container = op.patch.containerElement || document.body;

canv.width = canv.height = 256;
canv.style.position = "absolute";

const ctx = canv.getContext("2d");
outEle.setRef(canv);

inSize.onChange =
    inClear.onChange = updateUi;
inAddDom.onChange = updateDom;
op.onDelete = removeFromDom;
width.onChange =
    height.onChange = updateManualSize;

updateUi();
updateDom();

function updateDom()
{
    if (inAddDom.get()) container.appendChild(canv);
    else removeFromDom();
}

function removeFromDom()
{
    if (canv.parentNode) canv.parentNode.removeChild(canv);
}

function updateUi()
{
    const fixedSize = inSize.get() != "Maximize";
    width.setUiAttribs({ "greyout": !fixedSize });
    height.setUiAttribs({ "greyout": !fixedSize });
    inR.setUiAttribs({ "greyout": !inClear.get() });
    inG.setUiAttribs({ "greyout": !inClear.get() });
    inB.setUiAttribs({ "greyout": !inClear.get() });
    inA.setUiAttribs({ "greyout": !inClear.get() });
    if (inSize.get() != "Contain") setCanvasStyle("", "", "", "");
    if (fixedSize) updateManualSize();
}

function updateManualSize()
{
    if (inSize.get() == "Maximize") return;
    setCanvasSize(width.get(), height.get());
}

function updateMaximizedSize()
{
    const rect = container.getBoundingClientRect();
    setCanvasSize(Math.round(rect.width), Math.round(rect.height));
}

function updateContainStyle()
{
    const rect = container.getBoundingClientRect();
    if (!canv.width || !canv.height) return;
    const scale = Math.min(rect.width / canv.width, rect.height / canv.height);
    const styleWidth = canv.width * scale;
    const styleHeight = canv.height * scale;
    setCanvasStyle(styleWidth + "px", styleHeight + "px", (rect.width - styleWidth) / 2 + "px", (rect.height - styleHeight) / 2 + "px");
}

function setCanvasStyle(w, h, left, top)
{
    if (canv.style.width != w) canv.style.width = w;
    if (canv.style.height != h) canv.style.height = h;
    if (canv.style.left != left) canv.style.left = left;
    if (canv.style.top != top) canv.style.top = top;
}

function setCanvasSize(w, h)
{
    if (canv.width != w) canv.width = w;
    if (canv.height != h) canv.height = h;
    outWidth.set(canv.width);
    outHeight.set(canv.height);
}

exec.onTriggered = () =>
{
    if (inSize.get() == "Maximize") updateMaximizedSize();
    else if (inSize.get() == "Contain" && inAddDom.get()) updateContainStyle();

    op.patch.tempData.canvasCompose = { "canvas": canv, "ctx": ctx };
    if (inClear.get())
    {
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.fillStyle = "rgba(" + inR.get() * 255 + "," + inG.get() * 255 + "," + inB.get() * 255 + "," + inA.get() + ")";
        ctx.fillRect(0, 0, canv.width, canv.height);
    }
    ctx.fillStyle = "grey";
    ctx.strokeStyle = DEFAULT_STROKE_STYLE;
    ctx.lineWidth = DEFAULT_STROKE_WIDTH;
    ctx.antiAlias = true;

    if (inCanvas.get() && inCanvas.get().width > 0 && inCanvas.get().height > 0) ctx.drawImage(inCanvas.get(), 0, 0);

    next.trigger();
    op.patch.tempData.canvasCompose = null;

    finished.trigger();
};
