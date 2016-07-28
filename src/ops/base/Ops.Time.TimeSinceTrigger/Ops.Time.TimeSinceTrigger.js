op.name="TimeSinceTrigger";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addInPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var next=op.addOutPort(new Port(op,"next",OP_PORT_TYPE_FUNCTION));
var time=op.addOutPort(new Port(op,"time",OP_PORT_TYPE_VALUE));

var lastTrigger=Date.now()/1000;
time.set(-1);

exe.onTriggered=function()
{
    time.set( Date.now()/1000-lastTrigger);
    next.trigger();  
};

trigger.onTriggered=function()
{
    lastTrigger=Date.now()/1000;
    time.set(0);
};