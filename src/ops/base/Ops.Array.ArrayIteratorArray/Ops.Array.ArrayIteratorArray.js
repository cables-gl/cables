const
    exe=op.inTrigger("exe"),
    arr=op.inArray("array"),
    trigger=op.outTrigger('trigger'),
    idx=op.outValue("index"),
    val=op.outArray("Result");

exe.onTriggered=function()
{
    if(!arr.val)return;

        op.patch.instancing.pushLoop(arr.get().length);

    for(var i=0;i<arr.get().length;i++)
    {
        idx.set(i);
        val.set(null);
        val.set(arr.val[i]);
        trigger.trigger();
        op.patch.instancing.increment();

    }
        op.patch.instancing.popLoop();


};
