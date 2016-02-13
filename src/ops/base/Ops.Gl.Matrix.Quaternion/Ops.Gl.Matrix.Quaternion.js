
var cgl=this.patch.cgl;

this.name='quaternion';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var x=this.addInPort(new Port(this,"x"));
var y=this.addInPort(new Port(this,"y"));
var z=this.addInPort(new Port(this,"z"));
var w=this.addInPort(new Port(this,"w"));
x.set(0.0);
y.set(0.0);
z.set(0.0);
w.set(0.0);

var q=quat.create();
var qMat=mat4.create();

render.onTriggered=function()
{
    quat.set(q, x.get(),y.get(),z.get(),w.get());
    cgl.pushMvMatrix();

    mat4.fromQuat(qMat, q);
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);

    trigger.trigger();
    cgl.popMvMatrix();
};
