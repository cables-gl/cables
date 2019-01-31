const
    render=op.inTrigger('render'),
    x=op.inValueFloat("x"),
    y=op.inValueFloat("y"),

    r=op.outValue("r"),
    g=op.outValue("g"),
    b=op.outValue("b"),
    a=op.outValue("a");

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

