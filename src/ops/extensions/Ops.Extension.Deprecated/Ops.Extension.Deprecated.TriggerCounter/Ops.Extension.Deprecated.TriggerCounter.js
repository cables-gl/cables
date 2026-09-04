op.name = "TriggerCounter";
// var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.Port.TYPE_FUNCTION));
// var reset=op.addInPort(new CABLES.Port(op,"reset",CABLES.Port.TYPE_FUNCTION));
let exe = op.inTriggerButton("exe");
let reset = op.inTriggerButton("reset");// op.addInPort(new CABLES.Port(op,"reset",CABLES.Port.TYPE_FUNCTION));

let trigger = op.outTrigger("trigger");
let num = op.addOutPort(new CABLES.Port(op, "timesTriggered", CABLES.Port.TYPE_VALUE));

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
