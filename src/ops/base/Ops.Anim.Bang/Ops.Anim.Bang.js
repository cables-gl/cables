const
    inUpdate=op.inTrigger("update"),
    inBang=op.inTriggerButton("Bang"),
    inDuration=op.inValue("Duration",0.1),
    invert=op.inBool("Invert",false),
    outTrigger = op.outTrigger("Trigger Out"),
    outValue=op.outValue("Value");

const anim=new CABLES.Anim();
var startTime=CABLES.now();
op.toWorkPortsNeedToBeLinked(inUpdate);

inBang.onTriggered=function()
{
    startTime=CABLES.now();

    anim.clear();
    anim.setValue(0,1);
    anim.setValue(inDuration.get(),0);
};

inUpdate.onTriggered=function()
{
    var v=anim.getValue((CABLES.now()-startTime)/1000);
    if(invert.get()) outValue.set(1.0-v);
        else outValue.set(v);

    outTrigger.trigger();
};