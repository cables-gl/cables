const
    exe = op.inTrigger("exe"),
    number = op.inValue("number", 0),
    min = op.inValue("min", 0),
    max = op.inValue("max", 1),
    triggerThen = op.outTrigger("then"),
    triggerElse = op.outTrigger("else"),
    outBetween = op.outBoolNum("bs between");

exe.onTriggered = function ()
{
    if (number.get() >= min.get() && number.get() < max.get())
    {
        outBetween.set(true);
        triggerThen.trigger();
    }
    else
    {
        outBetween.set(false);
        triggerElse.trigger();
    }
};
