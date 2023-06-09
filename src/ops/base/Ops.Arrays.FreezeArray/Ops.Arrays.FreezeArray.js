const
    inArr = op.inArray("Number"),
    inFreeze = op.inTriggerButton("Button"),
    inHidden = op.inString("storedJson"),
    outArr = op.outArray("Frozen Array");

inFreeze.onTriggered =
inHidden.onTriggered = update;

inHidden.setUiAttribs({ "hideParam": true, "hidePort": true, "ignoreBigPort": true });

function update()
{
    if (inArr.get())
        inHidden.set(JSON.stringify(inArr.get()));
    else
        inHidden.set("");
}

outArr.onLinkChanged = () =>
{
    if (inHidden.get())
        outArr.set(JSON.parse(inHidden.get()));
};

inHidden.onChange = () =>
{
    inHidden.get();
    outArr.set(null);
    try
    {
        outArr.set(JSON.parse(inHidden.get()));
    }
    catch (e) {}
};
