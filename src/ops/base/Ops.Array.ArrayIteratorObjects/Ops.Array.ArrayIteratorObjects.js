var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var arr=op.addInPort(new CABLES.Port(op,"array",CABLES.OP_PORT_TYPE_ARRAY));

var trigger=op.outTrigger('trigger');
var idx=op.addOutPort(new CABLES.Port(op,"index"));
var val=op.addOutPort(new CABLES.Port(op,"value",CABLES.OP_PORT_TYPE_OBJECT));

exe.onTriggered=function()
{
    if(!arr.val)return;
    for(var i=0;i<arr.get().length;i++)
    {
        idx.set(i);
        val.set(arr.val[i]);
        trigger.trigger();
    }
};
