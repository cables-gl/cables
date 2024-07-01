// constatnts
let NUM_PORTS = 10;

// inputs
let exePort = op.inTriggerButton("Execute");
let enablePorts = [];
createInPorts();

// outputs
let triggerBeforePort = op.outTrigger("Trigger Before");
let triggerPorts = [];
createOutPorts();
let triggerAfterPort = op.outTrigger("Trigger After");

// listeners
exePort.onTriggered = setOutPorts;

// functions

function setOutPorts()
{
    triggerBeforePort.trigger();
    for (let i = 0; i < NUM_PORTS; i++)
    {
        if (enablePorts[i].get())
        {
            triggerPorts[i].trigger();
        }
    }
    triggerAfterPort.trigger();
}

function createInPorts()
{
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.inValueBool("Enable " + i, false);
        enablePorts.push(port);
    }
}

function createOutPorts()
{
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.outTrigger("Trigger " + i);
        triggerPorts.push(port);
    }
}
