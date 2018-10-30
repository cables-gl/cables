var inTriggerPort = op.inTrigger("In Trigger");
var timePort = op.inValue("Milliseconds", 300);

var outTriggerPort = op.outTrigger("Out Trigger");
var progress=op.outValue("Progress");

var lastTriggerTime = 0;

inTriggerPort.onTriggered = function()
{
    var now = CABLES.now();
    var prog=(now-lastTriggerTime)/timePort.get();

    if(prog>1.0)prog=1.0;
    if(prog<0.0)prog=0.0;

    progress.set(prog);

    if(now >=lastTriggerTime + timePort.get())
    {
        lastTriggerTime = now;
        outTriggerPort.trigger();
    }
};

