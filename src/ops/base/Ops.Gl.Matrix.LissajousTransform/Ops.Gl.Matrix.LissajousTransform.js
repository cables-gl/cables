this.name="lissajous transform";

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
var z=this.addInPort(new Port(this,"z",OP_PORT_TYPE_VALUE));
var pointSkip=this.addInPort(new Port(this,"skip",OP_PORT_TYPE_VALUE));
var numPoints=this.addInPort(new Port(this,"num points",OP_PORT_TYPE_VALUE));

var mulX=this.addInPort(new Port(this,"mul x",OP_PORT_TYPE_VALUE));
var mulY=this.addInPort(new Port(this,"mul y",OP_PORT_TYPE_VALUE));
var mulZ=this.addInPort(new Port(this,"mul z",OP_PORT_TYPE_VALUE));

x.set(2);
y.set(4);
z.set(8);

mulX.set(1);
mulY.set(1);
mulZ.set(1);
pointSkip.set(40);
numPoints.set(3200);

var cgl=this.patch.cgl;
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
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
