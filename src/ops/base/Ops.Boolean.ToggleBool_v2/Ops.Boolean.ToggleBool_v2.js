const
    trigger = op.inTriggerButton("trigger"),
    reset = op.inTriggerButton("reset"),
    inDefault = op.inBool("Default", false),
    next = op.outTrigger("Next"),
    outBool = op.outBoolNum("result");

let theBool = false;

op.onLoadedValueSet = () =>
{
    theBool = inDefault.get();
    outBool.set(inDefault.get());
    next.trigger();
};

trigger.onTriggered = function ()
{
    theBool = !theBool;
    outBool.set(theBool);
    next.trigger();
};

reset.onTriggered = function ()
{
    theBool = inDefault.get();
    outBool.set(theBool);
    next.trigger();
};
