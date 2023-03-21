const
    exe = op.inTrigger("exe"),
    arr = op.inArray("array"),
    trigger = op.outTrigger("trigger"),
    finished = op.outTrigger("finished"),
    idx = op.outNumber("index"),
    val = op.outObject("value");

exe.onTriggered = function ()
{
    const theArr = arr.get();
    if (!theArr) return;

    for (let i = 0; i < theArr.length; i++)
    {
        val.setRef(theArr[i]);
        idx.set(i);

        trigger.trigger();
    }
    finished.trigger();
};
