let valueBefore = -1;

// input
let valuePort = op.inValue("Value", -1);

// output
let outTrigger = op.outTrigger("Became Zero Trigger");

valuePort.onChange = function ()
{
    let value = valuePort.get();
    if (valueBefore != 0 & value == 0)
    {
        outTrigger.trigger();
    }
    valueBefore = value;
};
