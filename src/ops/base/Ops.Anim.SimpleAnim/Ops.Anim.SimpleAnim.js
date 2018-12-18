const
    exe=op.inTrigger("exe"),
    reset=op.inTriggerButton("reset"),
    rewind=op.inTriggerButton("rewind"),
    inStart=op.inValueFloat("start",0),
    inEnd=op.inValueFloat("end",1),
    duration=op.inValueFloat("duration",0.5),
    loop=op.inValueBool("loop"),
    waitForReset=op.inValueBool("Wait for Reset",true),
    next=op.outTrigger("Next"),
    result=op.outValue("result"),
    finished=op.outValue("finished"),
    finishedTrigger=op.outTrigger("Finished Trigger");

const anim=new CABLES.Anim();
var resetted=false;
anim.createPort(op,"easing",init);
var currentEasing=-1;
loop.onChange=init;
init();

duration.onChange=init;


function init()
{
    if(anim.keys.length!=3)
    {
        anim.setValue(0,0);
        anim.setValue(1,0);
        anim.setValue(2,0);
    }

    anim.keys[0].time=CABLES.now()/1000.0;
    anim.keys[0].value=inStart.get();
    if(anim.defaultEasing!=currentEasing) anim.keys[0].setEasing(anim.defaultEasing);

    anim.keys[1].time=duration.get()+CABLES.now()/1000.0;
    anim.keys[1].value=inEnd.get();

    if(anim.defaultEasing!=currentEasing) anim.keys[1].setEasing(anim.defaultEasing);

    anim.loop=loop.get();
    if(anim.loop)
    {
        anim.keys[2].time=(2.0*duration.get())+CABLES.now()/1000.0;
        anim.keys[2].value=inStart.get();
        if(anim.defaultEasing!=currentEasing) anim.keys[2].setEasing(anim.defaultEasing);
    }
    else
    {
        anim.keys[2].time=anim.keys[1].time;
        anim.keys[2].value=anim.keys[1].value;
        if(anim.defaultEasing!=currentEasing) anim.keys[2].setEasing(anim.defaultEasing);
    }
    finished.set(false);

    currentEasing=anim.defaultEasing;
}

reset.onTriggered=function()
{
    resetted=true;
    init();
};

rewind.onTriggered=function()
{
    anim.keys[0].time=CABLES.now()/1000.0;
    anim.keys[0].value=inStart.get();

    anim.keys[1].time=CABLES.now()/1000.0;
    anim.keys[1].value=inStart.get();

    anim.keys[2].time=CABLES.now()/1000.0;
    anim.keys[2].value=inStart.get();

    result.set(inStart.get());
};

exe.onTriggered=function()
{
    if(waitForReset.get() && !resetted)
    {
        result.set(inStart.get());
        return;
    }
    var t=CABLES.now()/1000;
    var v=anim.getValue(t);
    result.set(v);
    if(anim.hasEnded(t))
    {
        if(!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }

    next.trigger();
};

