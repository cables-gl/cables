//Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='laser reset';
this.render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));


this.trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));


this.render.onTriggered=function()
{
cgl.frameStore.laserPoints.length=0;
    self.trigger.trigger();
};


