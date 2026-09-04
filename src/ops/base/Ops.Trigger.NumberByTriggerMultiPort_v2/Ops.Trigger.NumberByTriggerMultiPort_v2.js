const
    inTrigs = op.inMultiPort2("Trigger", CABLES.Port.TYPE_TRIGGER, { "display": "button" }),
    next = op.outTrigger("Next"),
    switchPort = op.outNumber("Number Triggered");

inTrigs.on("trigger", (index) =>
{
    switchPort.set(index);
});
