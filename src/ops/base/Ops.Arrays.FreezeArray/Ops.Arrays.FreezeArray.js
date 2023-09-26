const
    inArr = op.inArray("Number"),
    inFreeze = op.inTriggerButton("Button"),
    inHidden = op.inString("storedJson"),
    outArr = op.outArray("Frozen Array");

inFreeze.onTriggered =
inHidden.onTriggered = update;

inHidden.setUiAttribs({ "hideParam": true, "hidePort": true, "ignoreBigPort": true });

let changed = false;

inArr.onChange = () =>
{
    changed = true;
};

function update()
{
    if (changed)
    {
        changed = false;
        if (inArr.get())
            inHidden.set(JSON.stringify(inArr.get()));
        else
            inHidden.set("");
    }
}

outArr.onLinkChanged = () =>
{
    if (inHidden.get())
        outArr.setRef(JSON.parse(inHidden.get()));
};

inHidden.onChange = () =>
{
    inHidden.get();
    try
    {
        outArr.setRef(JSON.parse(inHidden.get()));
    }
    catch (e) {}
};
