op.name='CanvasSize';

var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var width=op.addOutPort(new CABLES.Port(op,"width",CABLES.OP_PORT_TYPE_VALUE));
var height=op.addOutPort(new CABLES.Port(op,"height",CABLES.OP_PORT_TYPE_VALUE));

var cgl=op.patch.cgl;
var w=0,h=0;

exe.onTriggered=function()
{
    height.set(cgl.canvasHeight);
    width.set(cgl.canvasWidth);
};

