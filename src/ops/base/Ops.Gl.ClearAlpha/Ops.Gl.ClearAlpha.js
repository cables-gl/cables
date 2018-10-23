op.name='ClearAlpha';

var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

var a=op.addInPort(new Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

a.set(1.0);

render.onTriggered=function()
{
    cgl.gl.colorMask(false, false, false, true);
    cgl.gl.clearColor(0, 0, 0, a.get());
    cgl.gl.clear(cgl.gl.GL_COLOR_BUFFER_BIT | cgl.gl.GL_DEPTH_BUFFER_BIT);
    cgl.gl.colorMask(true, true, true, true);

    trigger.trigger();
};
