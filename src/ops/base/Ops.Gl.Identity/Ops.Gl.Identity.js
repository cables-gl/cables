const exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
const trigger=op.outTrigger('trigger');
const cgl=op.patch.cgl;

exe.onTriggered=function()
{
    cgl.pushModelMatrix();

    mat4.identity(cgl.mMatrix);
    trigger.trigger();

    cgl.popModelMatrix();
};