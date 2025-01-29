const
    inTrigger = op.inTrigger("Trigger"),
    inRepetitions = op.inInt("Repetitions", 5),
    inInterval = op.inFloat("Interval (ms)", 100),
    inReset = op.inTriggerButton("Reset"),

    outTrigger = op.outTrigger("Out");

let numTriggered = 0;
let timeoutId = null;

inRepetitions.onChange = resetTriggerCount;
inInterval.onChange = resetTriggerCount;
inTrigger.onTriggered = triggerPorts;
inReset.onTriggered = resetTriggerCount;

function resetTriggerCount() {
    numTriggered = 0;
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
}

function triggerPorts() {
    const repetitions = inRepetitions.get();
    const interval = inInterval.get();

    function trigger() {
        if (numTriggered < repetitions) {
            outTrigger.trigger();
            numTriggered++;
            timeoutId = setTimeout(trigger, interval);
        }
    }

    trigger();
}
