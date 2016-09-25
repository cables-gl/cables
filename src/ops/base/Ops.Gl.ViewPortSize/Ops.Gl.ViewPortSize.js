
op.name='ViewPortSize';
var exe=op.inFunction("exe");
var trigger=op.outFunction("trigger");

var x=op.addOutPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var y=op.addOutPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
var width=op.addOutPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addOutPort(new Port(op,"height",OP_PORT_TYPE_VALUE));

var cgl=op.patch.cgl;
var w=0,h=0,x=0,y=0;

exe.onTriggered=function()
{
    var vp=cgl.getViewPort();
    
    if(vp[0]!=x) w=x.set(vp[0]);
    if(vp[1]!=y) h=y.set(vp[1]);
    if(vp[2]!=h) h=width.set(vp[2]);
    if(vp[3]!=w) w=height.set(vp[3]);
    
    trigger.trigger();
};
