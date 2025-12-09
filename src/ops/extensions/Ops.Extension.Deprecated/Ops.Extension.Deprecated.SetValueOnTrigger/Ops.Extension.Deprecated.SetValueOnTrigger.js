// inputs
let valuePort = op.inValueString("Value");
let setValuePort = op.inTrigger("Set Value");

// outputs
let outValuePort = op.outValue("Out Value");
outValuePort.changeAlways = true;

// change listeners
setValuePort.onTriggered = function ()
{
    outValuePort.set(valuePort.get());
};
