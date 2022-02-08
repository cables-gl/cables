const
    exe = op.inTrigger("exe"),
    arr = op.inArray("array"),
    trigger = op.outTrigger("trigger"),
    idx = op.outNumber("index"),
    val = op.outArray("Result");

exe.onTriggered = function ()
{
    const theArr = arr.get();

    if (!theArr)
    {
        val.set(null);
        return;
    }

    for (let i = 0; i < theArr.length; i++)
    {
        idx.set(i);
        val.set(theArr[i]);
        trigger.trigger();
    }
};
