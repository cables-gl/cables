const
    cursorPort = op.inValueSelect("cursor",["auto","crosshair","pointer","hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help", "none"]),
    trigger=op.inTriggerButton("Set Cursor"),
    cgl = op.patch.cgl;

cursorPort.onChange=trigger.onTriggered=update;

function update()
{
    var cursor = cursorPort.get();
    cgl.canvas.style.cursor = cursor;
}

