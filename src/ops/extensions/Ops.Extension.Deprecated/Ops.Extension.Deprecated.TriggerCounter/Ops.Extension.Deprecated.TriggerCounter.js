op.name = "TriggerCounter";
// var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
// var reset=op.addInPort(new CABLES.Port(op,"reset",CABLES.OP_PORT_TYPE_FUNCTION));
let exe = op.inTriggerButton("exe");
let reset = op.inTriggerButton("reset");// op.addInPort(new CABLES.Port(op,"reset",CABLES.OP_PORT_TYPE_FUNCTION));

let trigger = op.outTrigger("trigger");
let num = op.addOutPort(new CABLES.Port(op, "timesTriggered", CABLES.OP_PORT_TYPE_VALUE));

let n = 0;

exe.onTriggered = function ()
{
    n++;
    num.set(n);
    trigger.trigger();
};

reset.onTriggered = function ()
{
    n = 0;
    num.set(n);
};
