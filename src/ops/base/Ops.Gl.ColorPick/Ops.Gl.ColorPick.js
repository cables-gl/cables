var cgl=op.patch.cgl;

op.name='ColorPick';
var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var x=op.addInPort(new Port(op,"x",CABLES.OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"y",CABLES.OP_PORT_TYPE_VALUE));

var r=op.addOutPort(new Port(op,"r",CABLES.OP_PORT_TYPE_VALUE));
var g=op.addOutPort(new Port(op,"g",CABLES.OP_PORT_TYPE_VALUE));
var b=op.addOutPort(new Port(op,"b",CABLES.OP_PORT_TYPE_VALUE));
var a=op.addOutPort(new Port(op,"a",CABLES.OP_PORT_TYPE_VALUE));

var pixelValues = new Uint8Array(4);

function doRender()
{
    cgl.gl.readPixels(x.get(), cgl.canvas.height-y.get(),1,1,cgl.gl.RGBA,cgl.gl.UNSIGNED_BYTE,pixelValues);
    r.set(pixelValues[0]/255);
    g.set(pixelValues[1]/255);
    b.set(pixelValues[2]/255);
    a.set(pixelValues[3]/255);
}

render.onTriggered=doRender;
