
op.name='ArrayIterator';
var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var arr=op.addInPort(new Port(op,"array",CABLES.OP_PORT_TYPE_ARRAY));

var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var idx=op.addOutPort(new Port(op,"index"));
var val=op.addOutPort(new Port(op,"value"));

exe.onTriggered=function()
{
    if(!arr.val)return;
    
    op.patch.instancing.pushLoop(arr.get().length);

    for(var i=0;i<arr.get().length;i++)
    {
        idx.set(i);
        val.set(arr.val[i]);
        trigger.trigger();
        op.patch.instancing.increment();

    }
    op.patch.instancing.popLoop();

};
