
op.name='Repeat';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var num=op.addInPort(new Port(op,"num"));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var idx=op.addOutPort(new Port(op,"index"));

num.set(5);

exe.onTriggered=function()
{
    for(var i=num.get()-1;i>-1;i--)
    {
        idx.set(i);
        trigger.trigger();
    }
};

