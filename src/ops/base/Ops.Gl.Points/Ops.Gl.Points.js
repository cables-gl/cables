var self=this;
var cgl=self.patch.cgl;

this.name='Points';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.pointSize=this.addInPort(new Port(this,"pointSize"));

this.render.onTriggered=function()
{
    cgl.points=true;
    self.trigger.trigger();
    cgl.points=false;

};

this.pointSize.val=5;
