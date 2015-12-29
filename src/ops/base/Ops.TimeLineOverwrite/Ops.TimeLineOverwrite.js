Op.apply(this, arguments);
var self=this;

this.name='TimeLineOverwrite';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.newTime=this.addInPort(new Port(this,"new time"));

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
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
