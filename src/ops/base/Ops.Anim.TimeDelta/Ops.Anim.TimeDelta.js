const
    exe=op.inTriggerButton("exe"),
    smooth=op.inValueBool("Smooth",false),
    seconds=op.inValueBool("Seconds",false),
    trigger=op.outTrigger('trigger'),
    result=op.outValue("result");

var lastTime=CABLES.now();
var diff=0;
var smoothed=-1;

exe.onTriggered=function()
{
    diff=(CABLES.now()-lastTime);
    if(seconds.get()) diff/=1000;

    if(smooth.get())
    {
        if(smoothed==-1)smoothed=diff;
        else
        {
            smoothed=smoothed*0.8+diff*0.2;
            diff=smoothed;
        }
    }

    result.set( diff );
    lastTime=CABLES.now();
    trigger.trigger();
};

exe.onTriggered();
