
op.name='TimeDelta';
var exe=op.inFunctionButton("exe");
// op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var result=op.addOutPort(new Port(op,"result"));

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
