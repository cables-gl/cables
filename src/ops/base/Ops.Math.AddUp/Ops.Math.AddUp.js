const
    number = op.inValue("Number"),
    doAdd = op.inTriggerButton("Add"),
    doReset = op.inTriggerButton("Reset"),
    result = op.outNumber("Result");

let value = 0;

doAdd.onTriggered = function ()
{
    value += number.get();
    result.set(value);
};

doReset.onTriggered = function ()
{
    value = 0;
    result.set(value);
};
