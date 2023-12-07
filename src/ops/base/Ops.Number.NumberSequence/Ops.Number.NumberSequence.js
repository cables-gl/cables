const NUM_PORTS = 4;
const inPort = op.inValue("In Value");
const outTrigger = op.outTrigger("Value Changed");

const outPorts = [];
for (let i = 0; i < NUM_PORTS; i++)
{
    outPorts.push(op.outNumber("Out Value " + i));
}

// change listener
inPort.onChange = function ()
{
    const inValue = inPort.get();
    for (let i = 0; i < NUM_PORTS; i++)
    {
        outPorts[i].set(inValue);
    }
    outTrigger.trigger();
};
