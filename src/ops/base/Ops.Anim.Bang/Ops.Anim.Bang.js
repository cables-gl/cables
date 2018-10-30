const inUpdate=op.inTrigger("update");
const inBang=op.inTriggerButton("Bang");
const inDuration=op.inValue("Duration",0.1);
const outValue=op.outValue("Value");

const anim=new CABLES.TL.Anim();
var startTime=CABLES.now();

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
    outValue.set(v);
};