op.name='CanvasSize';

var width=op.addOutPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addOutPort(new Port(op,"height",OP_PORT_TYPE_VALUE));


var cgl=op.patch.cgl;


cgl.addEventListener("resize",function()
{
    height.set(cgl.canvasHeight);
    width.set(cgl.canvasWidth);
    
});