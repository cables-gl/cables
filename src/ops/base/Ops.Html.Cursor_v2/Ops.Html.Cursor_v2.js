const
    exec = op.inTriggerButton("Update"),

    cursorPort = op.inDropDown("CSS Cursors", ["auto", "crosshair", "pointer", "hand", "move", "n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "ew-resize", "text", "wait", "help", "none"], "pointer"),

    next = op.outTrigger("Next");

const cursorStr = "";

exec.onLinkChanged =
next.onLinkChanged = () =>
{
    op.patch.cgl.setCursor("auto");
};

exec.onTriggered = () =>
{
    op.patch.cgl.setCursor(cursorPort.get());
    next.trigger();
};
