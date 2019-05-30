const
    exe=op.inTrigger("exe"),
    arr=op.inArray("array"),
    trigger=op.outTrigger('trigger'),
    idx=op.outValue("index"),
    val=op.outArray("Result");

exe.onTriggered=function()
{

    var theArr=arr.get();

    if(!theArr)
    {
        val.set(null);
    }

    // op.patch.instancing.pushLoop(theArr.length);

    for(var i=0;i<theArr.length;i++)
    {
        idx.set(i);
        // val.set(null);
        // console.log(theArr[i]);
        val.set(theArr[i]);
        trigger.trigger();
        // op.patch.instancing.increment();
    }

    // op.patch.instancing.popLoop();
};
