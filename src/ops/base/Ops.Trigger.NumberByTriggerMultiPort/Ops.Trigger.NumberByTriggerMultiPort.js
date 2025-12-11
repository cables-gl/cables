const
    inTrigs = op.inMultiPort("Trigger", CABLES.OP_PORT_TYPE_TRIGGER, { "display": "button" }),
    next = op.outTrigger("Next"),
    switchPort = op.outNumber("Number Triggered");

inTrigs.on("trigger", (index) =>
{
    switchPort.set(index);
});
