const
    exec = op.inTriggerButton("Update"),
    filename = op.inUrl("file"),
    offX = op.inValueInt("Offset X"),
    offY = op.inValueInt("Offset Y"),
    next = op.outTrigger("Next");

offX.onChange =
    offY.onChange =
    filename.onChange = updateStr;

exec.onTriggered = update;

let str = "auto";

function updateStr()
{
    str = "url(" + op.patch.getFilePath(String(filename.get())) + ") " + offX.get() + " " + offX.get() + ", auto";
}

function update()
{
    op.patch.cgl.setCursor(str);
    next.trigger();
}

exec.onLinkChanged =
next.onLinkChanged = () =>
{
    op.patch.cgl.setCursor("auto");
};
