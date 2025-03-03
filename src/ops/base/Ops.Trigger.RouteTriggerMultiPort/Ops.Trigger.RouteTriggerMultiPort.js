const
    exePort = op.inTriggerButton("Execute"),
    switchPort = op.inValueInt("Switch Value"),
    numTrigs = op.outNumber("Total Connections"),
    outArrNames = op.outArray("Connected Op Names"),
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

outTrigs.on("onLinkChanged", () =>
{
    const arr = [];
    const trigs = outTrigs.get();
    for (let i = 0; i < trigs.length; i++)
    {
        if (trigs[i].isLinked())
        {
            const p = trigs[i].links[0].getOtherPort(trigs[i]);
            arr.push(p.op.opId);
        }
        // else
        // {
        // arr.push("none");
        // }
    }
    outArrNames.setRef(arr);
});
