const
    exe=op.inTriggerButton('Generate'),
    min=op.inFloat("min",0),
    max=op.inFloat("max",1),
    outTrig = op.outTrigger("next"),
    result=op.outNumber("result"),
    inInteger=op.inBool("Integer",false);

exe.onTriggered=genRandom;
max.onChange=genRandom;
min.onChange=genRandom;
inInteger.onChange=genRandom;

op.setPortGroup("Value Range",[min,max]);
genRandom();

function genRandom()
{
    var r=(Math.random()*(max.get()-min.get()))+min.get();
    if(inInteger.get())r=Math.floor(r);
    result.set(r);
    outTrig.trigger();
}
