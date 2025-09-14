const
    inElement = op.inObject("Element", null, "element"),
    inUpdate = op.inTriggerButton("Update"),
    outFocus = op.outBoolNum("Has Focus");

inUpdate.onTriggered = update;

function update()
{
    outFocus.set(document.activeElement == inElement.get());
}
