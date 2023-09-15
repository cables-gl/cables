const
    inTriggerTrue = op.inTriggerButton("True"),
    inTriggerFalse = op.inTriggerButton("false"),
    outResult = op.outBoolNum("Result");

inTriggerTrue.onTriggered = function ()
{
    outResult.set(true);
};

inTriggerFalse.onTriggered = function ()
{
    outResult.set(false);
};
