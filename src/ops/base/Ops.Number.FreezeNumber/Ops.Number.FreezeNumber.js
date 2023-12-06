const
    inStr = op.inFloat("Number", 0),
    inFreeze = op.inTriggerButton("Button"),
    inHidden = op.inFloat("StoredNumber"),
    outNum = op.outNumber("Frozen Number");

inFreeze.onTriggered =
inHidden.onTriggered = update;

inHidden.setUiAttribs({ "hideParam": true, "hidePort": true });

outNum.onLinkChanged = () =>
{
    outNum.set(inHidden.get());
};

function update()
{
    inHidden.set(inStr.get());
    outNum.set(inHidden.get());
}
