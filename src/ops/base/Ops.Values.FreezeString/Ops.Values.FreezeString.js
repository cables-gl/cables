const
    inStr = op.inString("String", "default"),
    inFreeze = op.inTriggerButton("Button"),
    inHidden = op.inString("StoredString"),
    outString = op.outString("Frozen String");

inFreeze.onTriggered =
inHidden.onTriggered = update;

inHidden.setUiAttribs({ "hideParam": true, "hidePort": true, "ignoreBigPort": true });

outString.onLinkChanged = () =>
{
    outString.set(inHidden.get());
};

function update()
{
    inHidden.set(inStr.get());
    outString.set(inHidden.get());
}
