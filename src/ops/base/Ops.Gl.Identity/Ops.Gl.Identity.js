const exe=op.inTrigger("exe");
const trigger=op.outTrigger('trigger');
const cgl=op.patch.cgl;

exe.onTriggered=function()
{
    cgl.pushModelMatrix();

    mat4.identity(cgl.mMatrix);
    trigger.trigger();

    cgl.popModelMatrix();
};