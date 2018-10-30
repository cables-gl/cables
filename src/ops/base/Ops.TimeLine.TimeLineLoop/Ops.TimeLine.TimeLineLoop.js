var execute=op.addInPort(new CABLES.Port(op,"Execute",CABLES.OP_PORT_TYPE_FUNCTION));
var duration=op.addInPort(new CABLES.Port(this,"duration"));
var trigger=op.outTrigger('trigger');
duration.set(2);
execute.onTriggered=function()
{

    if(op.patch.timer.getTime()>duration.get())
    {
        op.patch.timer.setTime(0);
    }
    
    trigger.trigger();
};