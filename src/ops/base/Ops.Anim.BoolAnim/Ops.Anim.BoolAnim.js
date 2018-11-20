const
    exe=op.inTrigger("exe"),
    bool=op.inValueBool("bool"),
    valueFalse=op.inValue("value false",0),
    valueTrue=op.inValue("value true",1),
    duration=op.inValue("duration",0.5),
    next=op.outTrigger("trigger"),
    value=op.outValue("value"),
    finished=op.outTrigger("finished"),
    finishedTrigger=op.outTrigger("Finished Trigger");

var anim=new CABLES.Anim();
anim.createPort(op,"easing");
var startTime=CABLES.now();

bool.onChange=
    valueFalse.onChange=
    valueTrue.onChange=
    duration.onChange=setAnim;
setAnim();

function setAnim()
{
    finished.set(false);
    var now=(CABLES.now()-startTime)/1000;
    var oldValue=anim.getValue(now);
    anim.clear();

    anim.setValue(now,oldValue);

    if(!bool.get()) anim.setValue(now+duration.get(),valueFalse.get());
        else anim.setValue(now+duration.get(),valueTrue.get());
}


exe.onTriggered=function()
{
    var t=(CABLES.now()-startTime)/1000;
    value.set(anim.getValue(t));

    if(anim.hasEnded(t))
    {
        if(!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }

    next.trigger();
};

