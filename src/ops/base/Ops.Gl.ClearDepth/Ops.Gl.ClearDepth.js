Op.apply(this, arguments);
var cgl=this.patch.cgl;

this.name='ClearDepth';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

render.onTriggered=function()
{
    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);
    trigger.trigger();
};
