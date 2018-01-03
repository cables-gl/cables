// constants
var NUM_PORTS = 10;

// inputs
var exePort = op.inFunctionButton('Execute');
var switchPort = op.inValue('Switch Value');

// outputs
var nextTriggerPort = op.outFunction('Next Trigger');
var valueOutPort = op.outValue('Switched Value');
var triggerPorts = [];
for(var j=0; j<NUM_PORTS; j++) {
    triggerPorts[j] = op.outFunction('Trigger ' + j);
}
var defaultTriggerPort = op.outFunction('Default Trigger');

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