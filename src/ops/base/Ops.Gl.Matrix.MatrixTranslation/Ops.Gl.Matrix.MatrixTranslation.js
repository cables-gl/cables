const
    render = op.inTrigger("render"),
    inArr = op.inArray("Matrix"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z");

const cgl = op.patch.cgl;
const pos = vec3.create();
const identVec = vec3.create();
const iViewMatrix = mat4.create();

render.onTriggered = function ()
{
    if (!inArr.get()) return;

    mat4.invert(iViewMatrix, inArr.get());
    vec3.transformMat4(pos, identVec, iViewMatrix);

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
};
