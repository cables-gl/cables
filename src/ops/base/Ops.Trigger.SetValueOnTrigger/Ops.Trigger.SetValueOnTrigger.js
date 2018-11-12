// inputs
var valuePort = op.inValueString("Value");
var setValuePort = op.inTrigger("Set Value");

// outputs
var outValuePort = op.outValue("Out Value");
outValuePort.changeAlways = true;

// change listeners
setValuePort.onTriggered = function() {
    outValuePort.set(valuePort.get());
};