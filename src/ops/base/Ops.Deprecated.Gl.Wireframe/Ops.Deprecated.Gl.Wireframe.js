var self=this;
var cgl=self.patch.cgl;

this.name='Wireframe';
this.render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
this.lineWidth=this.addInPort(new Port(this,"lineWidth"));

this.render.onTriggered=function()
{
    cgl.wireframe=true;
    // cgl.gl.lineWidth(self.lineWidth.val);
    self.trigger.trigger();
    cgl.wireframe=false;

};

this.lineWidth.val=2;
