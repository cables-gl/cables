op.name = "TriggerOnce";

let exe = op.inTrigger("Exec");
let reset = op.outTrigger("Reset");
let next = op.inTriggerButton("Next");

let triggered = false;

reset.onTriggered = function ()
{
    triggered = false;
};

exe.onTriggered = function ()
{
    if (triggered) return;

    triggered = true;
    next.trigger();
};
