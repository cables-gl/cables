const
    exe = op.inTriggerButton("exe"),
    reset = op.inTriggerButton("reset"),
    trigger = op.outTrigger("trigger"),
    num = op.outValue("timesTriggered");

op.toWorkPortsNeedToBeLinked(exe);

let n = 0;

reset.onTriggered =
op.onLoaded =
    doReset;

exe.onTriggered = function ()
{
    n++;
    num.set(n);
    trigger.trigger();
};

function doReset()
{
    n = 0;
    num.set(n);
}
