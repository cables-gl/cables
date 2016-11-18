
op.name='ClearDepth';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);
    trigger.trigger();
};


