// uses its input port for caching the length of the timeline...

const
    inLength = op.inFloat("len", 0),
    outLength = op.outNumber("Length");

inLength.setUiAttribs({ "hidePort": true, "hideParam": true });

if (CABLES.UI)
{
    inLength.set(gui.getTimeLineLength());

    gui.on("timelineControl", (cmd, l) =>
    {
        if (cmd === "setLength")
        {
            inLength.set(l);
            outLength.set(inLength.get());
        }
    });
    outLength.set(inLength.get());
}

op.on("loadedValueSet", () =>
{
    outLength.set(inLength.get());
});
