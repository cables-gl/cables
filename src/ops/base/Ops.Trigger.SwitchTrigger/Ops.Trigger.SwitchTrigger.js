const NUM_PORTS = 16;

const
    inIndex = op.inValueInt("Trigger Index", 0),
    triggerPorts = [],
    outTrig = op.outTrigger("Trigger out");

for (let i = 0; i < NUM_PORTS; i++)
{
    const port = op.inTrigger("Trigger in " + i);
    port.data.inputNum = i;
    port.onTriggered = update;
    triggerPorts.onChange = update;
    triggerPorts.push(port);
}

function update()
{
    const index = Math.min(Math.max(inIndex.get(), 0), 15);
    if (this.data.inputNum == index) outTrig.trigger();
}
