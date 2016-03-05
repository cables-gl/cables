this.name="Ops.Gl.Matrix.LissajousTransform";

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
var pointStep=this.addInPort(new Port(this,"skip",OP_PORT_TYPE_VALUE));

var mulX=this.addInPort(new Port(this,"mul x",OP_PORT_TYPE_VALUE));
var mulY=this.addInPort(new Port(this,"mul y",OP_PORT_TYPE_VALUE));
var mulZ=this.addInPort(new Port(this,"mul z",OP_PORT_TYPE_VALUE));

mulX.set(1);
mulY.set(1);
mulZ.set(1);
pointStep.set(2);

var cgl=this.patch.cgl;
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

function doRender()
{
    var vec=vec3.create();
    var step=parseFloat(pointStep.get()) || 1;
    if(step<1)step=1;
    
    for(var i = 0; i < 800; i+=step)
    {
        var xPct = (i * x.get()) * 0.001;
        var yPct = (i * y.get()) * 0.001;

        var ix = mulX.get() * Math.sin(xPct);
        var iy = mulY.get() * Math.cos(yPct);
        var iz = mulZ.get() * Math.sin(i*0.5);
        

        vec3.set(vec,ix,iy,iz);

        cgl.pushMvMatrix();

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec );
        trigger.trigger();

        cgl.popMvMatrix();
    }
}

render.onTriggered=doRender;

