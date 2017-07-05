op.name='Frequency';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var frequency=op.addInPort(new Port(op,"frequency",OP_PORT_TYPE_VALUE));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outCPS=op.outValue("CPS");

var startTime=0;
exe.onTriggered=exec;

frequency.onChange=function()
{
    outCPS.set(1000/frequency.get());
};


function exec()
{
    if(CABLES.now()-startTime>frequency.get())
    {
        startTime=CABLES.now();
        trigger.trigger();
    }
}

