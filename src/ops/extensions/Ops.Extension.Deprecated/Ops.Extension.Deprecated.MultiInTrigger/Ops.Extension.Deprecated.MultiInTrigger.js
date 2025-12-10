op.name = "MultiInTrigger";

// constants
let N_PORTS = 4;

// vars
let inPorts = [];

// functions
function triggerOutput()
{
    outTriggerPort.trigger();
}

// inputs
for (let i = 0; i < N_PORTS; i++)
{
    let port = op.inTriggerButton("Execute " + (i + 1));
    port.onTriggered = triggerOutput;
    inPorts.push(port);
}

// outpus
var outTriggerPort = op.outTrigger("Trigger");
