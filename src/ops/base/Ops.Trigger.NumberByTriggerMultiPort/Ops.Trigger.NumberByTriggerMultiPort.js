const
    inTrigs = op.inMultiPort("Trigger", CABLES.Port.TYPE_TRIGGER),
    next = op.outTrigger("Next"),
    switchPort = op.outNumber("Number Triggered");

inTrigs.onTriggered = (index) =>
{
    switchPort.set(index);
};
