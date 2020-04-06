const
    inTrigger=op.inTriggerButton("Trigger"),
    inObj=op.inObject("Object"),
    outTrigger=op.outTrigger("Next"),
    outObj=op.outObject("Result");

inTrigger.onTriggered=function()
{
    outObj.set(null);
    outObj.set(inObj.get());
    outTrigger.trigger();
};
