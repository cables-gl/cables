// inputs
let valuePort = op.inValueString("Value");
let setValuePort = op.inTrigger("Set Value");

// outputs
let outValuePort = op.outNumber("Out Value");
outValuePort.changeAlways = true;

// change listeners
setValuePort.onTriggered = function ()
{
    outValuePort.set(valuePort.get());
};
