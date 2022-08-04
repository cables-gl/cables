const
    exe = op.inTriggerButton("exe"),
    next = op.outTrigger("Next");

exe.onTriggered = function ()
{
    op.patch.timer.setTime(0);
    next.trigger();
};
