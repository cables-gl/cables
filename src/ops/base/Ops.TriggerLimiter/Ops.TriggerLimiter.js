op.name="TriggerLimiter";

// input
var inTriggerPort = op.inFunction("In Trigger");
var timePort = op.inValue("Milliseconds", 300);


// output
var outTriggerPort = op.outFunction("Out Trigger");
var progress=op.outValue("Progress");


// vars
var lastTriggerTime = 0;


// change listeners
inTriggerPort.onTriggered = function()
{
    var now = CABLES.now();
    var prog=(now-lastTriggerTime )/timePort.get();

    if(prog>1.0)prog=1.0;
    if(prog<0.0)prog=0.0;

    // console.log(prog);
    progress.set(prog);

    if(now >=lastTriggerTime + timePort.get())
    {
        lastTriggerTime = now;
        // progress.set(1.0);
        outTriggerPort.trigger();
    }
    

};

