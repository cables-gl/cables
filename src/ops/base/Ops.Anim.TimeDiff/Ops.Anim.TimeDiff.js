

var exe=op.inTriggerButton("exe");
// op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.outTrigger('trigger');
var result=op.addOutPort(new CABLES.Port(op,"result"));

var smooth=op.inValueBool("Smooth",false);
var seconds=op.inValueBool("Seconds",false);

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
