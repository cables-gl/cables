const
    trigger = op.inTriggerButton("Trigger"),
    duration = op.inValue("Duration", 1),
    valueTrue = op.inValue("Value True", 1),
    valueFalse = op.inValue("Value False", 0),
    resetButton = op.inTriggerButton("Reset"),
    outAct = op.outTrigger("Activated"),
    outEnded = op.outTrigger("Ended"),
    result = op.outBoolNum("Result", false);

let lastTimeout = -1;

resetButton.onTriggered = function ()
{
    result.set(valueFalse.get());

    clearTimeout(lastTimeout);
};

trigger.onTriggered = function ()
{
    if (result.get() == valueFalse.get())outAct.trigger();
    result.set(valueTrue.get());

    clearTimeout(lastTimeout);
    lastTimeout = setTimeout(function ()
    {
        result.set(valueFalse.get());
        outEnded.trigger();
    }, duration.get() * 1000);
};
