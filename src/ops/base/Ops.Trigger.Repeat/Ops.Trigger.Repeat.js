const
    exe=op.inTrigger("exe"),
    num=op.inValueInt("num",5),
    trigger=op.outTrigger("trigger"),
    idx=op.addOutPort(new CABLES.Port(op,"index"));

exe.onTriggered=function()
{
    for(var i=Math.round(num.get())-1;i>-1;i--)
    {
        idx.set(i);
        trigger.trigger();
    }
};

