var cgl=op.patch.cgl;

op.name='ColorPick';
var render=op.inTrigger('render');
var x=op.addInPort(new CABLES.Port(op,"x",CABLES.OP_PORT_TYPE_VALUE));
var y=op.addInPort(new CABLES.Port(op,"y",CABLES.OP_PORT_TYPE_VALUE));

var r=op.addOutPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE));
var g=op.addOutPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE));
var b=op.addOutPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE));
var a=op.addOutPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE));

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
