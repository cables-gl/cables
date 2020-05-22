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

duration.onChange=
    inValue.onChange=init;

var lastTime=0;
var startTime=0;
var offset=0;

var firsttime=true;


function init()
{
    startTime=performance.now();
    anim.clear(CABLES.now()/1000.0);

    if(firsttime) anim.setValue( CABLES.now()/1000.0, inValue.get());

    anim.setValue( duration.get()+CABLES.now()/1000.0, inValue.get(),triggerFinished);

    firsttime=false;

}

function triggerFinished()
{
    finished.trigger();
}


exe.onTriggered=function()
{
    var t=CABLES.now()/1000;

    if(performance.now()-lastTime>300)
    {
        firsttime=true;
        init();
    }

    lastTime=performance.now();

    var v=anim.getValue(t);

    result.set(v);
    next.trigger();
};