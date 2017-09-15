op.name="Bang";

var inUpdate=op.inFunction("update");
var inBang=op.inFunctionButton("Bang");
var inDuration=op.inValue("Duration",0.1);

var outValue=op.outValue("Value");

var anim=new CABLES.TL.Anim();

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