op.name="SetValueOnTrigger";

// inputs
var valuePort = op.inValueString("Value");
var setValuePort = op.inFunction("Set Value");

// outputs
var outValuePort = op.outValue("Out Value");

// change listeners
setValuePort.onTriggered = function() {
    outValuePort.set(valuePort.get());
};