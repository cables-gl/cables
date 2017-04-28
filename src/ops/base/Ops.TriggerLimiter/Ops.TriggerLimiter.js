op.name="TriggerLimiter";

// constants
var DEFAULT_TIME = 300;

// vars
var lastTriggerTime = 0;

// input
var inTriggerPort = op.inFunction("In Trigger");
var timePort = op.inValue("Milliseconds", DEFAULT_TIME);

// change listeners
inTriggerPort.onTriggered = function() {
    var now = Date.now();
    if(now > lastTriggerTime + timePort.get()) {
        outTriggerPort.trigger();
        lastTriggerTime = now;
    }
}

// output
var outTriggerPort = op.outFunction("Out Trigger");