const
    exe = op.inTriggerButton("Update"),
    inTime = op.inFloat("Time", 0),
    next = op.outTrigger("Next");

exe.onTriggered = function ()
{
    op.patch.timer.setTime(parseFloat(inTime.get()));
    next.trigger();
};
