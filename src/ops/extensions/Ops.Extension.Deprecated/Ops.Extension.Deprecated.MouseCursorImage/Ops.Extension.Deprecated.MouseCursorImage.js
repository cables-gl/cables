const
    filename = op.inFile("file"),
    trigger = op.inTriggerButton("Set Cursor"),
    offX = op.inInt("Offset X"),
    offY = op.inInt("Offset Y");

offX.onChange = offY.onChange =
filename.onChange = update;
trigger.onTriggered = update;

function update()
{
    let str = "url(" + op.patch.getFilePath(String(filename.get())) + ") " + offX.get() + " " + offX.get() + ", auto";
    op.patch.cgl.canvas.style.cursor = str;
}
