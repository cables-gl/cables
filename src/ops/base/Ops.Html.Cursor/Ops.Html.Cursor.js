op.name='Cursor';

var cursorPort = op.addInPort(new Port(op,"cursor",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["auto","crosshair","pointer","Hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help", "none"]} ));
var oldCursor = '';
var cgl = op.patch.cgl;

function update() {
    var cursor = cursorPort.get();
    if(cursor != oldCursor) {
        cgl.canvas.style.cursor = cursor;
        oldCursor = cursor;
    }
}

cursorPort.onChange = update;
