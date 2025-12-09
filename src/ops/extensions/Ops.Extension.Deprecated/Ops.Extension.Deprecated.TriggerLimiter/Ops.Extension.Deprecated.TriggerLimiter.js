let inTriggerPort = op.inTrigger("In Trigger");
let timePort = op.inValue("Milliseconds", 300);

let outTriggerPort = op.outTrigger("Out Trigger");
let progress = op.outValue("Progress");

let lastTriggerTime = 0;

inTriggerPort.onTriggered = function ()
{
    let now = CABLES.now();
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
