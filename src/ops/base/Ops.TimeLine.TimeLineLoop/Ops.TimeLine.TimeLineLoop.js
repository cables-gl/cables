var execute=op.addInPort(new CABLES.Port(op,"Execute",CABLES.OP_PORT_TYPE_FUNCTION));
var duration=op.addInPort(new CABLES.Port(this,"duration"));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
duration.set(2);
execute.onTriggered=function()
{

    if(op.patch.timer.getTime()>duration.get())
    {
        op.patch.timer.setTime(0);
    }
    
    trigger.trigger();
};