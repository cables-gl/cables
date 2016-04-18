op.name='Cursor';

var cursor=op.addInPort(new Port(op,"cursor",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["auto","crosshair","pointer","Hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help"]} ));
var oldCursor='';
var cgl=op.patch.cgl;

var update=function()
{
    if(cursor.get()!=oldCursor) cgl.canvas.style.cursor=cursor.get();
};

cursor.onValueChange(update);
