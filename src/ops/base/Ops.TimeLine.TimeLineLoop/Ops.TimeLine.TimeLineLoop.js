var execute=op.inTrigger("Execute");
var duration=op.inValueFloat("duration",2);
var trigger=op.outTrigger('trigger');

execute.onTriggered=function()
{
    if(op.patch.timer.getTime()>duration.get())
        op.patch.timer.setTime(0);

    trigger.trigger();
};