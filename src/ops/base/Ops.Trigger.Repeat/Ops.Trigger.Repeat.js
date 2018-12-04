const exe=op.inTrigger("exe");
const num=op.inValueInt("num",5);

const trigger=op.outTrigger("trigger")
const idx=op.addOutPort(new CABLES.Port(op,"index"));

exe.onTriggered=function()
{
    for(var i=Math.round(num.get())-1;i>-1;i--)
    {
        idx.set(i);
        trigger.trigger();
    }
};

