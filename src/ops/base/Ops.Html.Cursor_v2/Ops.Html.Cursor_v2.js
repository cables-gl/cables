const
    exec = op.inTriggerButton("Update"),
    cursorPort = op.inDropDown("CSS Cursors", ["auto", "crosshair", "pointer", "hand", "move", "n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "ew-resize", "text", "wait", "help", "none"], "pointer"),
    parentEle = op.inBool("Set Parent Element", true),
    next = op.outTrigger("Next");

const cursorStr = "";

exec.onLinkChanged =
next.onLinkChanged = () =>
{
    op.patch.cgl.setCursor("auto");
};

exec.onTriggered = () =>
{
    let arg2 = null;
    if (parentEle.get())arg2 = cursorPort.get();
    op.patch.cgl.setCursor(cursorPort.get(), arg2);
    next.trigger();
};
