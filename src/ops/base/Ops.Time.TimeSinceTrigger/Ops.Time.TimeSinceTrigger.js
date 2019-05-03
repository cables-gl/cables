const
    exe=op.inTrigger("exe"),
    trigger=op.inTriggerButton("trigger"),
    reset=op.inTriggerButton("reset"),
    next=op.outTrigger("next"),
    time=op.outValue("time");

var lastTrigger=op.patch.freeTimer.get();
time.set(0);

exe.onTriggered=function()
{
    time.set( op.patch.freeTimer.get()-lastTrigger);
    next.trigger();
};

reset.onTriggered=function()
{
    time.set(0);
};

trigger.onTriggered=function()
{
    lastTrigger=op.patch.freeTimer.get();
    time.set(0);
};