const
    inVal = op.inValue("Value"),
    inReset = op.inTriggerButton("Reset"),
    outResult = op.outNumber("Result");

let count = 0;

inReset.onTriggered = function ()
{
    count = 0;
};

inVal.onChange = function ()
{
    count++;
    outResult.set(count);
};
