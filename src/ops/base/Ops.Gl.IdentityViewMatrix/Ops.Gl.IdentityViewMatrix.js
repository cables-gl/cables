op.name='view Identity ';

var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

exe.onTriggered=function()
{
    cgl.pushViewMatrix();

    mat4.identity(cgl.vMatrix);
    trigger.trigger();

    cgl.popViewMatrix();
};