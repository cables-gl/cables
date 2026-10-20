const
    inUpdate = op.inTriggerButton("Update"),
    inCanvas = op.inObject("Canvas", null, "element"),
    inFormat = op.inSwitch("Format", ["png", "jpeg", "webp"], "png"),
    inQuality = op.inFloatSlider("Quality", 0.92),
    next = op.outTrigger("Next"),
    outDataUrl = op.outString("Data URL", "");

outDataUrl.ignoreValueSerialize = true;

inFormat.onChange = updateUi;
updateUi();

function updateUi()
{
    inQuality.setUiAttribs({ "greyout": inFormat.get() == "png" });
}

inUpdate.onTriggered = () =>
{
    const canvas = inCanvas.get();
    if (!(canvas instanceof HTMLCanvasElement))
    {
        op.setUiError("nocanvas", canvas ? "Canvas is not a canvas element" : "no canvas", 1);
        outDataUrl.set("");
        next.trigger();
        return;
    }
    op.setUiError("nocanvas", null);

    try
    {
        outDataUrl.set(canvas.toDataURL("image/" + inFormat.get(), inQuality.get()));
        op.setUiError("tainted", null);
    }
    catch (e)
    {
        op.setUiError("tainted", "canvas can not be read: " + e.message, 2);
        outDataUrl.set("");
    }

    next.trigger();
};
