var cursorPort = op.addInPort(new Port(op,"cursor",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["auto","crosshair","pointer","hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help", "none"]} ));
var trigger=op.inFunctionButton("Set Cursor");

var cgl = op.patch.cgl;

function update()
{
    var cursor = cursorPort.get();
    cgl.canvas.style.cursor = cursor;
}

cursorPort.onChange = update;
trigger.onTriggered=update;