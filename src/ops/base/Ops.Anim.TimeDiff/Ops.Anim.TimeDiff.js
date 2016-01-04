CABLES.Op.apply(this, arguments);

this.name='TimeDiff';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.result=this.addOutPort(new Port(this,"result"));

var self=this;
var lastTime=Date.now();

this.exe.onTriggered=function()
{
    self.result.val=(Date.now()-lastTime);
    lastTime=Date.now();
    self.trigger.trigger();
};

this.exe.onTriggered();
