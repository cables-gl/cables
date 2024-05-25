const
    exePort = op.inTriggerButton("Execute"),
    switchPort = op.inValueInt("Switch Value"),
    numTrigs = op.outNumber("Total Connections"),
    outTrigs = op.outMultiPort("Trigger", CABLES.OP_PORT_TYPE_FUNCTION);

exePort.onTriggered = update;

function update()
{
    const trigs = outTrigs.get();
    numTrigs.set(trigs.length);

    const index = Math.floor(switchPort.get());
    if (index >= 0 && index < trigs.length)
    {
        trigs[index].trigger();
    }
}
