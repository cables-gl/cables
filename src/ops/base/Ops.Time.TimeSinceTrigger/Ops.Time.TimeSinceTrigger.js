
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addInPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var next=op.addOutPort(new CABLES.Port(op,"next",CABLES.OP_PORT_TYPE_FUNCTION));
var time=op.addOutPort(new CABLES.Port(op,"time",CABLES.OP_PORT_TYPE_VALUE));

var lastTrigger=op.patch.freeTimer.get();
time.set(-1);

exe.onTriggered=function()
{
    time.set( op.patch.freeTimer.get()-lastTrigger);
    next.trigger();  
};

trigger.onTriggered=function()
{
    lastTrigger=op.patch.freeTimer.get();
    time.set(0);
};