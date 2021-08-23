const
    exe = op.inTrigger("exe"),
    arr = op.inArray("array"),
    trigger = op.outTrigger("trigger"),
    finished = op.outTrigger("finished"),
    idx = op.outValue("index"),
    val = op.outObject("value");

exe.onTriggered = function ()
{
    if (!arr.get()) return;
    for (let i = 0; i < arr.get().length; i++)
    {
        val.set(arr.val[i]);
        idx.set(i);

        trigger.trigger();
    }
    finished.trigger();
};
