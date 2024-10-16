const
    exe = op.inTrigger("Exe"),
    arr = op.inArray("Array"),
    trigger = op.outTrigger("Trigger"),
    idx = op.outNumber("Index"),
    val = op.outString("Value");

exe.onTriggered = function ()
{
    if (!arr.get()) return;

    for (let i = 0; i < arr.get().length; i++)
    {
        idx.set(i);
        let value = null;
        if (arr.get()[i])
        {
            value = String(arr.get()[i]);
        }
        val.set(value);
        trigger.trigger();
        // op.patch.instancing.increment();
    }
};
