const
    inTrigs = op.inMultiPort("Trigger", CABLES.OP_PORT_TYPE_TRIGGER),
    next = op.outTrigger("Next"),
    switchPort = op.outNumber("Number Triggered");

inTrigs.onTriggered = (index) =>
{
    switchPort.set(index);
};
