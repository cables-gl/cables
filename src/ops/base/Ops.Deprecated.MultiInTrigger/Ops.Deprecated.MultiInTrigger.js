op.name="MultiInTrigger";

// constants
var N_PORTS = 4;

// vars
var inPorts = [];

// functions
function triggerOutput() {
    outTriggerPort.trigger();
}

// inputs
for(var i=0; i<N_PORTS; i++) {
    var port = op.inTriggerButton("Execute " + (i+1));
    port.onTriggered = triggerOutput; 
    inPorts.push(port);
}

// outpus
var outTriggerPort = op.outTrigger("Trigger");