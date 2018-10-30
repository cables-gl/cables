op.name='Identity';
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;

exe.onTriggered=function()
{
    cgl.pushModelMatrix();

    mat4.identity(cgl.mvMatrix);
    trigger.trigger();

    cgl.popModelMatrix();
};