const
    exe=op.inTrigger("exe"),
    inValue=op.inValue("Value"),
    duration=op.inValueFloat("duration"),
    next=op.outTrigger("Next"),
    result=op.outValue("result"),
    finished=op.outTrigger("Finished");

const anim=new CABLES.Anim();
anim.createPort(op,"easing",init);

anim.loop=false;
duration.set(0.5);

duration.onChange=init;
inValue.onChange=init;

function init()
{
    anim.clear(CABLES.now()/1000.0);
    anim.setValue(
        duration.get()+CABLES.now()/1000.0, inValue.get(),triggerFinished);
}

function triggerFinished()
{
    finished.trigger();
}

exe.onTriggered=function()
{
    var t=CABLES.now()/1000;
    var v=anim.getValue(t);

    result.set(v);
    next.trigger();
};