const
    exec = op.inTriggerButton("Update"),
    cursorPort = op.inDropDown("CSS Cursors", ["auto", "crosshair", "pointer", "hand", "move", "n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "ew-resize", "text", "wait", "help", "none"], "pointer"),
    parentEle = op.inBool("Set Parent Element", true),
    next = op.outTrigger("Next");

const cursorStr = "";
exec.onTriggered = update;

let lastParentCursor = "";

exec.onLinkChanged =
next.onLinkChanged = () =>
{
    op.patch.cgl.setCursor("auto");
};

parentEle.onChange = () =>
{
    if (!parentEle.get())
    {
        lastParentCursor = "auto";
        op.patch.cgl.canvas.parentElement.style.cursor = "auto";
    }
};

function update()
{
    let arg2 = null;

    op.patch.cgl.setCursor(cursorPort.get(), arg2);

    if (parentEle.get() && lastParentCursor != cursorPort.get())
        op.patch.cgl.canvas.parentElement.style.cursor = cursorPort.get();

    next.trigger();
}
