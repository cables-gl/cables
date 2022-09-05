const
    inTriggerPort = op.inTriggerButton("Execute"),
    outTriggerPort = op.outTrigger("Next");

inTriggerPort.onTriggered = function ()
{
    outTriggerPort.trigger();
};
