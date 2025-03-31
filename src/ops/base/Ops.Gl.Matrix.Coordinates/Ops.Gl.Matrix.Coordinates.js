const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    pos = vec3.create(),
    empty = vec3.create();

render.onTriggered = function ()
{
    const cg = op.patch.cg || op.patch.cgl;

    vec3.transformMat4(pos, empty, cg.mMatrix);

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
};
