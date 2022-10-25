const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z");

const
    cgl = op.patch.cgl,
    pos = vec3.create(),
    identVec = vec3.create(),
    iViewMatrix = mat4.create();

render.onTriggered = update;

function update()
{
    mat4.invert(iViewMatrix, cgl.vMatrix);
    vec3.transformMat4(pos, identVec, iViewMatrix);

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
}
