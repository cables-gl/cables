const NUM_PORTS = 16;

const
    inIndex = op.inValueInt("Trigger Index", 0),
    triggerPorts = [],
    outTrig = op.outTrigger("Trigger out");

for (let i = 0; i < NUM_PORTS; i++)
{
    const port = op.inTrigger("Trigger in " + i);
    port.onTriggered = function () { update(i); };
    triggerPorts.onChange = function () { update(i); };
    triggerPorts.push(port);
}

function update(inputNum)
{
    const index = Math.min(Math.max(inIndex.get(), 0), 15);
    if (inputNum == index) outTrig.trigger();
}
