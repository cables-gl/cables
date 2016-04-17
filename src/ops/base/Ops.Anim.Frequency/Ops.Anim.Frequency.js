op.name='Frequency';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var frequency=op.addInPort(new Port(op,"frequency",OP_PORT_TYPE_VALUE));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var startTime=0;
exe.onTriggered=exec;

function exec()
{
    if(Date.now()-startTime>frequency.get())
    {
        startTime=Date.now();
        trigger.trigger();
    }
}

