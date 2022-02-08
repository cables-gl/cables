const
    inStr = op.inFloat("Number", 0),
    inFreeze = op.inTriggerButton("Button"),
    inHidden = op.inFloat("StoredNumber"),
    outString = op.outNumber("Frozen Number");

inFreeze.onTriggered =
inHidden.onTriggered = update;

inHidden.setUiAttribs({ "hideParam": true, "hidePort": true });

function update()
{
    inHidden.set(inStr.get());
    outString.set(inHidden.get());
}
