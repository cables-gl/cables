// inputs
var inTriggerPort = op.inFunctionButton('Execute');

// outputs
var outTriggerPort = op.outFunction('Next');

// trigger listener
inTriggerPort.onTriggered = function() {
    outTriggerPort.trigger();
};