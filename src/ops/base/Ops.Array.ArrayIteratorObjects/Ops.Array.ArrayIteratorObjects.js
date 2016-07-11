
op.name='ArrayIterator Objects';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var arr=op.addInPort(new Port(op,"array",OP_PORT_TYPE_ARRAY));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var idx=op.addOutPort(new Port(op,"index"));
var val=op.addOutPort(new Port(op,"value",OP_PORT_TYPE_OBJECT));

exe.onTriggered=function()
{
    if(!arr.val)return;
    for(var i in arr.val)
    {
        idx.set(i);
        val.set(arr.val[i]);
        trigger.trigger();
    }
};
