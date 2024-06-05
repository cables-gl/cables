const NUM_PORTS = 24;
const
    exePort = op.inTriggerButton("Execute"),
    switchPort = op.inValueInt("Switch Value"),
    nextTriggerPort = op.outTrigger("Next Trigger"),
    valueOutPort = op.outNumber("Switched Value");

const triggerPorts = [];
exePort.onTriggered = update;

for (let j = 0; j < NUM_PORTS; j++)
{
    triggerPorts[j] = op.outTrigger("Trigger " + j);

    triggerPorts[j].onLinkChanged = countLinks;
}

const
    defaultTriggerPort = op.outTrigger("Default Trigger"),
    outNumConnected = op.outNumber("Highest Index");

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

function countLinks()
{
    let count = 0;
    for (let i = 0; i < triggerPorts.length; i++)
        if (triggerPorts[i] && triggerPorts[i].isLinked())count = i;

    outNumConnected.set(count);
}
