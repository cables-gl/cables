op.name="lissajous transform";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var x=op.addInPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
var z=op.addInPort(new Port(op,"z",OP_PORT_TYPE_VALUE));
var pointSkip=op.addInPort(new Port(op,"skip",OP_PORT_TYPE_VALUE));
var numPoints=op.addInPort(new Port(op,"num points",OP_PORT_TYPE_VALUE));

var mulX=op.addInPort(new Port(op,"mul x",OP_PORT_TYPE_VALUE));
var mulY=op.addInPort(new Port(op,"mul y",OP_PORT_TYPE_VALUE));
var mulZ=op.addInPort(new Port(op,"mul z",OP_PORT_TYPE_VALUE));

x.set(2);
y.set(4);
z.set(8);

mulX.set(1);
mulY.set(1);
mulZ.set(1);
pointSkip.set(40);
numPoints.set(3200);

var cgl=op.patch.cgl;
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var vec=vec3.create();

function doRender()
{
    var step=parseFloat(pointSkip.get()) || 1;
    if(step<1)step=1;
    
    for(var i = 0; i < numPoints.get(); i+=step)
    {
        vec3.set(
            vec,
            mulX.get() * Math.sin( (i * x.get()) * 0.001 ),
            mulY.get() * Math.cos( (i * y.get()) * 0.001 ),
            mulZ.get() * Math.sin( (i * z.get()) * 0.001 )
            );

        cgl.pushMvMatrix();

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec );
        trigger.trigger();

        cgl.popMvMatrix();
    }
}

render.onTriggered=doRender;
