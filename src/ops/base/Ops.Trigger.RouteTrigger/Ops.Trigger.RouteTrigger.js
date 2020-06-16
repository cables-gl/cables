// constants
const NUM_PORTS = 24;

// inputs
const exePort = op.inTriggerButton("Execute");
const switchPort = op.inValueInt("Switch Value");

// outputs
const nextTriggerPort = op.outTrigger("Next Trigger");
const valueOutPort = op.outValue("Switched Value");
const triggerPorts = [];
for (let j = 0; j < NUM_PORTS; j++)
{
    triggerPorts[j] = op.outTrigger("Trigger " + j);
}
const defaultTriggerPort = op.outTrigger("Default Trigger");

// functions

/**
 * Performs the switch case
 */
function update()
{
    const index = Math.round(switchPort.get());
    if (index >= 0 && index < NUM_PORTS)
    {
        valueOutPort.set(index);
        triggerPorts[index].trigger();
    }
    else
    {
        valueOutPort.set(-1);
        defaultTriggerPort.trigger();
    }
    nextTriggerPort.trigger();
}

// change listeners / trigger events
exePort.onTriggered = update;
