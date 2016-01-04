CABLES.Op.apply(this, arguments);

this.name='Frequency';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.frequency=this.addInPort(new Port(this,"frequency",OP_PORT_TYPE_VALUE));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var self=this;
var startTime=0;

this.exe.onTriggered=function()
{
    if(Date.now()-startTime>self.frequency.val)
    {
        startTime=Date.now();
        self.trigger.trigger();
    }
};