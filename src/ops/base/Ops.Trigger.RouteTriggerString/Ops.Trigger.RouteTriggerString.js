const NUM_PORTS = 24;
const exePort = op.inTriggerButton("Execute");
const switchPort = op.inString("Switch Value");
const nextTriggerPort = op.outTrigger("Next Trigger");
const valueOutPort = op.outNumber("Switched Index");

let index = -1;

const triggerPorts = [];
const namePorts = [];

for (let j = 0; j < NUM_PORTS; j++)
{
    triggerPorts[j] = op.outTrigger("Trigger " + j);
    namePorts[j] = op.inString("String " + j);
    namePorts[j].onChange = updateIndex;
}
// const defaultTriggerPort = op.outTrigger("Default Trigger");

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
        }
    }
    // if (index >= 0 && index < NUM_PORTS)
    // {
    //     valueOutPort.set(index);
    //     triggerPorts[index].trigger();
    // }
    // else
    // {
    //     valueOutPort.set(-1);
    //     defaultTriggerPort.trigger();
    // }
}

exePort.onTriggered = () =>
{
    if (index >= 0) triggerPorts[index].trigger();

    valueOutPort.set(index);
    nextTriggerPort.trigger();
};
