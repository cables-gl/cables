Op.apply(this, arguments);
var self=this;

this.name='TimeLineDelay';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

this.theTime=this.addOutPort(new Port(this,"time"));
this.delay=this.addInPort(new Port(this,"delay"));
this.delay.val=0.0;

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.exe.onTriggered=function()
{
    self.patch.timer.pauseEvents(true);
    self.patch.timer.setDelay(self.delay.val);
    self.theTime.val=self.patch.timer.getTime();
    self.trigger.trigger();
    self.patch.timer.setDelay(0);
    self.patch.timer.pauseEvents(false);
};