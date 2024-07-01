const
    val = op.inFloat("Value", 0),
    exe = op.inTrigger("Execute"),
    trigger = op.outTrigger("trigger");

let changed = false;

exe.onTriggered = function ()
{
    if (changed)
    {
        changed = false;
        trigger.trigger();
    }
};

val.onChange = function ()
{
    changed = true;
};
