Op.apply(this, arguments);
var cgl=this.patch.cgl;

this.name='Cursor';

//var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

var cursor=this.addInPort(new Port(this,"cursor",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["auto","crosshair","pointer","Hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help"]} ));

var oldCursor='';

var update=function()
{
    if(cursor.get()!=oldCursor) cgl.canvas.style.cursor=cursor.get();
};

cursor.onValueChange(update);
//render.onTriggered=update;


