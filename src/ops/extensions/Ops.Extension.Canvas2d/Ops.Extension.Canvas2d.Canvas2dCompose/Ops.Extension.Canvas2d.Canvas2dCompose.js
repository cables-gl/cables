const canv = document.createElement("canvas");
const
    exec = op.inTrigger("Exec"),
    inCanvas = op.inObject("Canvas Copy", null, "element"),
    width = op.inInt("Width", 256),
    height = op.inInt("Height", 256),
    inClear = op.inBool("Clear", true),
    next = op.outTrigger("Next"),
    outEle = op.outObject("Element", canv, "element"),
    finished = op.outTrigger("Finished");

canv.width = canv.height = 256;

const ctx = canv.getContext("2d");
outEle.setRef(canv);

width.onChange =
    height.onChange = () =>
    {
        canv.width = width.get();
        canv.height = height.get();
    };

exec.onTriggered = () =>
{
    op.patch.tempData.canvasCompose = { "canvas": canv, "ctx": ctx };
    if (inClear.get())
        ctx.clearRect(0, 0, width.get(), height.get());
    ctx.fillStyle = "grey";
    ctx.antiAlias = true;

    if (inCanvas.get() && inCanvas.get().width > 0 && inCanvas.get().height > 0) ctx.drawImage(inCanvas.get(), 0, 0);

    next.trigger();
    op.patch.tempData.canvasCompose = null;

    finished.trigger();
};
