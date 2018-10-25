var exe=op.inFunction("exe");
var trigger=op.outFunction("trigger");

var outX=op.addOutPort(new CABLES.Port(op,"x",CABLES.OP_PORT_TYPE_VALUE));
var outY=op.addOutPort(new CABLES.Port(op,"y",CABLES.OP_PORT_TYPE_VALUE));
var outWidth=op.addOutPort(new CABLES.Port(op,"width",CABLES.OP_PORT_TYPE_VALUE));
var outHeight=op.addOutPort(new CABLES.Port(op,"height",CABLES.OP_PORT_TYPE_VALUE));

var cgl=op.patch.cgl;
var w=0,h=0,x=0,y=0;

exe.onTriggered=function()
{
    var vp=cgl.getViewPort();
    
    if(vp[0]!=x) { w=vp[0]; outX.set(vp[0]); }
    if(vp[1]!=y) { h=vp[1]; outY.set(vp[1]); }
    if(vp[2]!=h) { h=vp[2]; outWidth.set(vp[2]); }
    if(vp[3]!=w) { w=vp[3]; outHeight.set(vp[3]); }
    
    trigger.trigger();
};
