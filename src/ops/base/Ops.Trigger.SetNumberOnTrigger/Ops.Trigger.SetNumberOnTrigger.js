const
    setValuePort = op.inTriggerButton("Set"),
    valuePort = op.inValueFloat("Number"),
    outValuePort = op.outValue("Out Value");

outValuePort.changeAlways = true;

setValuePort.onTriggered = function()
{
    outValuePort.set(valuePort.get());
};