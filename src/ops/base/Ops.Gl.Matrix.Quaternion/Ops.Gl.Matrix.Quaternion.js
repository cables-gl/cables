var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var x=op.addInPort(new Port(op,"x"));
var y=op.addInPort(new Port(op,"y"));
var z=op.addInPort(new Port(op,"z"));
var w=op.addInPort(new Port(op,"w"));

x.set(0.0);
y.set(0.0);
z.set(0.0);
w.set(0.0);

var q=quat.create();
var qMat=mat4.create();
var cgl=op.patch.cgl;
render.onTriggered=function()
{
    if(x.isAnimated())
    {
        var time=op.patch.timer.getTime();
        CABLES.TL.Anim.slerpQuaternion(time,q,x.anim,y.anim,z.anim,w.anim);
    }
    else
    {
        quat.set(q, x.get(),y.get(),z.get(),w.get());
    }
    cgl.pushModelMatrix();

    mat4.fromQuat(qMat, q);
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);

    trigger.trigger();
    cgl.popModelMatrix();
};
