const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    cgl = op.patch.cgl,
    pos = vec3.create(),
    empty = vec3.create();

render.onTriggered = function ()
{
    vec3.transformMat4(pos, empty, cgl.mMatrix);

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
};
