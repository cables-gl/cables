const
    inStr = op.inArray("Number"),
    inFreeze = op.inTriggerButton("Button"),
    inHidden = op.inString("storedJson"),
    outArr = op.outArray("Frozen Array");

inFreeze.onTriggered =
inHidden.onTriggered = update;

inHidden.setUiAttribs({ "hideParam": true, "hidePort": true });

function update()
{

    inHidden.set(JSON.stringify(inStr.get()));

}

inHidden.onChange=()=>
{
    outArr.set(null);
    try
    {
    outArr.set(JSON.parse(inHidden.get()));

    }catch(e){}
}
