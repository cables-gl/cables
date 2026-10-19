const canv = document.createElement("canvas");
const
    exec = op.inTrigger("Exec"),
    inCanvas = op.inObject("Canvas Copy", null, "element"),
    inSize = op.inSwitch("Size", ["Manual", "Maximize"], "Manual"),
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
    const manual = inSize.get() == "Manual";
    width.setUiAttribs({ "greyout": !manual });
    height.setUiAttribs({ "greyout": !manual });
    inR.setUiAttribs({ "greyout": !inClear.get() });
    inG.setUiAttribs({ "greyout": !inClear.get() });
    inB.setUiAttribs({ "greyout": !inClear.get() });
    inA.setUiAttribs({ "greyout": !inClear.get() });
    if (manual) updateManualSize();
}

function updateManualSize()
{
    if (inSize.get() != "Manual") return;
    setCanvasSize(width.get(), height.get());
}

function updateMaximizedSize()
{
    const rect = container.getBoundingClientRect();
    setCanvasSize(Math.round(rect.width), Math.round(rect.height));
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
