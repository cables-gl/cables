const
    exe=op.inTriggerButton("Update"),
    inTime=op.inFloat("Time",0);

exe.onTriggered=function()
{
    op.patch.timer.setTime(inTime.get());
};
