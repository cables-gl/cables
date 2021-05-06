const
    trigger = op.inTriggerButton("trigger"),
    reset = op.inTriggerButton("reset"),
    outBool = op.outBool("result"),
    inDefault = op.inBool("Default", false);

let theBool = false;
outBool.set(theBool);
outBool.ignoreValueSerialize = true;

trigger.onTriggered = function ()
{
    theBool = !theBool;
    outBool.set(theBool);
};

reset.onTriggered = function ()
{
    theBool = inDefault.get();
    outBool.set(theBool);
};
