const
    exe=op.inTrigger("exe"),
    trigger=op.inTriggerButton("trigger"),
    next=op.outTrigger("next"),
    time=op.outValue("time");

var lastTrigger=op.patch.freeTimer.get();
time.set(-1);

exe.onTriggered=function()
{
    time.set( op.patch.freeTimer.get()-lastTrigger);
    next.trigger();
};

trigger.onTriggered=function()
{
    lastTrigger=op.patch.freeTimer.get();
    time.set(0);
};