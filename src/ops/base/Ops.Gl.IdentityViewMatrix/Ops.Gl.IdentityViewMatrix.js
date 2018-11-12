const exe=op.inTrigger("exe");
const trigger=op.outTrigger('trigger');
const cgl=op.patch.cgl;

exe.onTriggered=function()
{
    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);
    trigger.trigger();
    cgl.popViewMatrix();
};