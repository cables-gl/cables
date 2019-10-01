// constants
var NUM_PORTS = 16;

// inputs
var exePort = op.inTriggerButton('Execute');
var switchPort = op.inValueInt('Switch Value');

// outputs
var nextTriggerPort = op.outTrigger('Next Trigger');
var valueOutPort = op.outValue('Switched Value');
var triggerPorts = [];
for(var j=0; j<NUM_PORTS; j++) {
    triggerPorts[j] = op.outTrigger('Trigger ' + j);
}
var defaultTriggerPort = op.outTrigger('Default Trigger');

// functions

/**
 * Performs the switch case
 */
function update() {
    var index = Math.round(switchPort.get());
    if(index >= 0 && index < NUM_PORTS) {
        valueOutPort.set(index);
        triggerPorts[index].trigger();
    } else {
        valueOutPort.set(-1);
        defaultTriggerPort.trigger();
    }
    nextTriggerPort.trigger();
}

// change listeners / trigger events
exePort.onTriggered = update;