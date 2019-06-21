const
    filename=op.inFile("file"),
    trigger=op.inTriggerButton("Set Cursor"),
    offX=op.inValueInt("Offset X"),
    offY=op.inValueInt("Offset Y");


offX.onChange=offY.onChange=
filename.onChange=update;
trigger.onTriggered=update;

function update()
{

    var str='url('+op.patch.getFilePath(String(filename.get()))+') '+offX.get()+' '+offX.get()+', auto';
    op.patch.cgl.canvas.style.cursor = str;
}

