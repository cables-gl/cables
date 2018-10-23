const exe=op.inFunctionButton("exe");
const reset=op.inFunctionButton("reset");
const trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
const num=op.addOutPort(new Port(op,"timesTriggered",OP_PORT_TYPE_VALUE));

var n=0;

exe.onTriggered= function()
{
    n++;
    num.set(n);
    trigger.trigger();
};

reset.onTriggered= function()
{
    n=0;
    num.set(n);
};
