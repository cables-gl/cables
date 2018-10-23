const exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
const num=op.inValueInt("num",5);

const trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
const idx=op.addOutPort(new Port(op,"index"));

exe.onTriggered=function()
{
    for(var i=Math.round(num.get())-1;i>-1;i--)
    {
        idx.set(i);
        trigger.trigger();
    }
};

