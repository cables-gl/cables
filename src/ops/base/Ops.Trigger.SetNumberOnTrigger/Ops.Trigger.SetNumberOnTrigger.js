// inputs
var valuePort = op.inValueFloat("Number");
var setValuePort = op.inTriggerButton("Set");

// outputs
var outValuePort = op.outValue("Out Value");
outValuePort.changeAlways = true;

// change listeners
setValuePort.onTriggered = function() {
    outValuePort.set(valuePort.get());
};