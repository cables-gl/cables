const
    inTriggerPort = op.inTrigger("In Trigger"),
    timePort = op.inValue("Milliseconds", 300),
    outTriggerPort = op.outTrigger("Out Trigger"),
    progress = op.outNumber("Progress");

let lastTriggerTime = 0;

// change listeners
inTriggerPort.onTriggered = function ()
{
    const now = CABLES.now();
    let prog = (now - lastTriggerTime) / timePort.get();

    if (prog > 1.0)prog = 1.0;
    if (prog < 0.0)prog = 0.0;

    progress.set(prog);

    if (now >= lastTriggerTime + timePort.get())
    {
        lastTriggerTime = now;
        outTriggerPort.trigger();
    }
};
