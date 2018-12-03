const render=op.inTrigger('render');
const x=op.addInPort(new CABLES.Port(op,"x",CABLES.OP_PORT_TYPE_VALUE));
const y=op.addInPort(new CABLES.Port(op,"y",CABLES.OP_PORT_TYPE_VALUE));

const r=op.addOutPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE));
const g=op.addOutPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE));
const b=op.addOutPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE));
const a=op.addOutPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE));

const cgl=op.patch.cgl;
var pixelValues = new Uint8Array(4);
render.onTriggered=doRender;

function doRender()
{
    cgl.gl.readPixels(x.get(), cgl.canvas.height-y.get(),1,1,cgl.gl.RGBA,cgl.gl.UNSIGNED_BYTE,pixelValues);
    r.set(pixelValues[0]/255);
    g.set(pixelValues[1]/255);
    b.set(pixelValues[2]/255);
    a.set(pixelValues[3]/255);
}

