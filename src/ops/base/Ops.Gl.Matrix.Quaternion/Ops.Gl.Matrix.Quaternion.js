const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    x = op.inFloat("x"),
    y = op.inFloat("y"),
    z = op.inFloat("z"),
    w = op.inFloat("w");

let q = quat.create();
let qMat = mat4.create();
let cgl = op.patch.cgl;
render.onTriggered = function ()
{
    if (x.isAnimated())
    {
        let time = op.patch.timer.getTime();
        CABLES.Anim.slerpQuaternion(time, q, x.anim, y.anim, z.anim, w.anim);
    }
    else
    {
        quat.set(q, x.get(), y.get(), z.get(), w.get());
    }
    cgl.pushModelMatrix();

    mat4.fromQuat(qMat, q);
    mat4.multiply(cgl.mMatrix, cgl.mMatrix, qMat);

    trigger.trigger();
    cgl.popModelMatrix();
};
