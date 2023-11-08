const
    funcName = op.inString("Function Name", "default"),
    triggerButton = op.inTriggerButton("Trigger"),
    inString1 = op.inString("Default Parameter 1"),
    inString2 = op.inString("Default Parameter 2"),
    inString3 = op.inString("Default Parameter 3"),
    outTrigger = op.outTrigger("Next"),
    outString1 = op.outString("Parameter 1"),
    outString2 = op.outString("Parameter 2"),
    outString3 = op.outString("Parameter 3");

triggerButton.onTriggered = triggered;

funcName.onChange = function ()
{
    op.patch.config[funcName.get()] = triggered;
};

function triggered()
{
    const arg1 = arguments.hasOwnProperty(0) && typeof arguments[0] !== "undefined" ? arguments[0] : inString1.get();
    const arg2 = arguments.hasOwnProperty(1) && typeof arguments[1] !== "undefined" ? arguments[1] : inString2.get();
    const arg3 = arguments.hasOwnProperty(2) && typeof arguments[2] !== "undefined" ? arguments[2] : inString3.get();
    outString1.set(arg1);
    outString2.set(arg2);
    outString3.set(arg3);
    outTrigger.trigger();
}
