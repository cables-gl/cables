op.name='Frequency';
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var frequency=op.addInPort(new CABLES.Port(op,"frequency",CABLES.OP_PORT_TYPE_VALUE));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
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

