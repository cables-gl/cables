// inputs
var inTriggerPort = op.inFunctionButton('Execute');

// outputs
var outTriggerPort = op.outTrigger('Next');

// trigger listener
inTriggerPort.onTriggered = function() {
    outTriggerPort.trigger();
};