const
    inStr = op.inString("String", "default"),
    inFreeze = op.inTriggerButton("Button"),
    inHidden = op.inString("StoredString"),
    outString = op.outString("Frozen String");

inFreeze.onTriggered =
inHidden.onTriggered = update;

outString.ignoreValueSerialize = true;

inHidden.setUiAttribs({ "hideParam": true, "hidePort": true, "ignoreBigPort": true });

outString.onLinkChanged = () =>
{
    outString.set(inHidden.get());
};

function update()
{
    const str = inStr.get();

    // if (str.length > 500000)
    // {
    //     op.setUiError("toobig", "String is too big! will not be saved in patch!", 1);
    //     outString.set(str);
    // }
    // else
    {
        inHidden.set(str);
        outString.set(inHidden.get());
    }
}
