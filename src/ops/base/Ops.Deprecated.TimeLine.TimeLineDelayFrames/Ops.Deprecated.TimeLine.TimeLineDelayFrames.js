var self=this;

this.exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

this.theTime=this.addOutPort(new CABLES.Port(this,"time"));
this.delay=this.addInPort(new CABLES.Port(this,"delay"));
this.delay.val=0.0;

this.fps=this.addInPort(new CABLES.Port(this,"fps"));
this.fps.val=30.0;

this.trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

this.exe.onTriggered=function()
{
    self.patch.timer.setDelay(self.delay.val/self.fps.val);
    self.theTime.val=self.patch.timer.getTime();
    self.trigger.trigger();
    self.patch.timer.setDelay(0);
};
