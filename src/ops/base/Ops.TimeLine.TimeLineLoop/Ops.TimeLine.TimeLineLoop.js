const
    execute = op.inTrigger("Execute"),
    duration = op.inValueFloat("duration", 2),
    trigger = op.outTrigger("trigger");

execute.onTriggered = function ()
{
    if (op.patch.timer.getTime() > duration.get())
        op.patch.timer.setTime(0);

    trigger.trigger();
};
