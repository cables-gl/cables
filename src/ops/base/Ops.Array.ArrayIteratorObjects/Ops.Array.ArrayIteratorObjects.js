const
    exe=op.inTrigger("exe"),
    arr=op.inArray("array"),
    trigger=op.outTrigger('trigger'),
    finished=op.outTrigger('finished'),
    idx=op.outValue("index"),
    val=op.outObject("value");

exe.onTriggered=function()
{
    if(!arr.val)return;
    for(var i=0;i<arr.get().length;i++)
    {
        idx.set(i);
        val.set(arr.val[i]);
        trigger.trigger();
    }
    finished.trigger();
};
