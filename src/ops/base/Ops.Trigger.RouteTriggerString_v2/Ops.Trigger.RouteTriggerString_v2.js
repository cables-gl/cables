const
    NUM_PORTS = 24,
    exePort = op.inTriggerButton("Execute"),
    switchPort = op.inString("Switch Value"),
    nextTriggerPort = op.outTrigger("Next Trigger"),
    valueOutPort = op.outNumber("Switched Index");

let index = -1;

const triggerPorts = [];
const namePorts = [];

for (let j = 0; j < NUM_PORTS; j++)
{
    triggerPorts[j] = op.outTrigger("Trigger " + j);
    namePorts[j] = op.inString("String " + j);
    namePorts[j].onChange = updateIndex;
}

op.onLoad =
    op.onInit =
    switchPort.onChange = updateIndex;

function updateIndex()
{
    index = -1;
    for (let i = 0; i < namePorts.length; i++)
    {
        if (namePorts[i].get() == switchPort.get())
        {
            index = i;
            break;
        }
    }
}

exePort.onTriggered = () =>
{
    if (index >= 0) triggerPorts[index].trigger();

    valueOutPort.set(index);
    nextTriggerPort.trigger();
};
