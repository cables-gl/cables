const exe=op.inTriggerButton("exe");
const reset=op.inTriggerButton("reset");
const trigger=op.outTrigger("trigger")
const num=op.addOutPort(new CABLES.Port(op,"timesTriggered",CABLES.OP_PORT_TYPE_VALUE));

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
