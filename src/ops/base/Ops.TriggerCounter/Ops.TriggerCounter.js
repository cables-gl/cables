Op.apply(this, arguments);
var self=this;

this.name='TriggerCounter';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.reset=this.addInPort(new Port(this,"reset",OP_PORT_TYPE_FUNCTION));

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.num=this.addOutPort(new Port(this,"timesTriggered",OP_PORT_TYPE_VALUE));

var num=0;

this.exe.onTriggered= function()
{
    num++;
    self.num.set(num);
    self.trigger.trigger();
};
this.reset.onTriggered= function()
{
    num=0;
    self.num.set(num);
};
