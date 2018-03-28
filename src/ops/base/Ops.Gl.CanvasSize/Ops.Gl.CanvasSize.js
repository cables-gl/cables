

var width=op.addOutPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addOutPort(new Port(op,"height",OP_PORT_TYPE_VALUE));
var pixelRatio=op.outValue("Pixel Ratio");
var aspect=op.outValue("Aspect Ratio");

var cgl=op.patch.cgl;
cgl.addEventListener("resize",update);
update();

function update()
{
    height.set(cgl.canvasHeight);
    width.set(cgl.canvasWidth);
    pixelRatio.set(window.devicePixelRatio);
    aspect.set(cgl.canvasWidth/cgl.canvasHeight);
}
