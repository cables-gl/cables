
op.name='TimeDiff';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var result=op.addOutPort(new Port(op,"result"));

var lastTime=Date.now();

exe.onTriggered=function()
{
    result.set( (Date.now()-lastTime) );
    lastTime=Date.now();
    trigger.trigger();
};

exe.onTriggered();
