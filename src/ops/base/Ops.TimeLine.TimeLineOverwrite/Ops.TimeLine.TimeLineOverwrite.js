var self=this;

this.exe=this.addInPort(new Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
this.newTime=this.addInPort(new Port(this,"new time"));

this.trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
this.theTime=this.addOutPort(new Port(this,"time"));
this.newTime.val=0.0;

var realTime=0;
this.exe.onTriggered=function()
{
    realTime=self.patch.timer.getTime();

    self.patch.timer.overwriteTime=self.newTime.val;
    self.trigger.trigger();
    self.patch.timer.overwriteTime=-1;
};
