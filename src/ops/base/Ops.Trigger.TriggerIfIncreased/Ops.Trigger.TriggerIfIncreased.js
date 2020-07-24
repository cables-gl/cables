const
    value = op.inFloat("Value"),
    trigger = op.outTrigger("Trigger");

let lastValue = -Number.MAX_VALUE;

value.onChange = function ()
{
    const v = value.get();
    if (v > lastValue)
    {
        trigger.trigger();
    }
    lastValue = v;
};
