Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='ClearAlpha';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.a=this.addInPort(new Port(this,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

this.a.val=1.0;

this.render.onTriggered=function()
{
    cgl.gl.colorMask(false, false, false, true);
    cgl.gl.clearColor(0, 0, 0, self.a.val);
    cgl.gl.clear(cgl.gl.GL_COLOR_BUFFER_BIT | cgl.gl.GL_DEPTH_BUFFER_BIT);
    cgl.gl.colorMask(true, true, true, true);

    self.trigger.trigger();
};
