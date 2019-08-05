var exe=op.inTriggerButton('Generate');
var min=op.inValue("min",0);
var max=op.inValue("max",1);
var outTrig = op.outTrigger("next");
var result=op.outValue("result");
var inInteger=op.inValueBool("Integer",false);

exe.onTriggered=genRandom;
max.onChange=genRandom;
min.onChange=genRandom;
inInteger.onChange=genRandom;

genRandom();

function genRandom()
{
    var r=(Math.random()*(max.get()-min.get()))+min.get();
    if(inInteger.get())r=Math.floor(r);
    result.set(r);
    outTrig.trigger();
}
