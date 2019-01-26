var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var x=op.inValueFloat("x");
var y=op.inValueFloat("y");
var z=op.inValueFloat("z");
var w=op.inValueFloat("w");

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
    mat4.multiply(cgl.mMatrix,cgl.mMatrix, qMat);

    trigger.trigger();
    cgl.popModelMatrix();
};
