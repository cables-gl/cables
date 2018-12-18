const
    exe=op.inTrigger("exe"),
    arr=op.inArray("array"),
    trigger=op.outTrigger('trigger'),
    idx=op.addOutPort(new CABLES.Port(op,"index")),
    val=op.addOutPort(new CABLES.Port(op,"value"));

exe.onTriggered=function()
{
    if(!arr.get())return;

    for(var i=0;i<arr.get().length;i++)
    {
        idx.set(i);
        val.set(arr.get()[i]);
        trigger.trigger();
        op.patch.instancing.increment();
    }

};
