const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z");

const
    cgl = op.patch.cgl,
    iViewMatrix = mat4.create();

render.onTriggered = update;

function update()
{
    mat4.invert(iViewMatrix, cgl.vMatrix);

    outX.set(iViewMatrix[12]);
    outY.set(iViewMatrix[13]);
    outZ.set(iViewMatrix[14]);

    trigger.trigger();
}
