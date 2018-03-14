var exe=op.inFunctionButton('Generate');
var min=op.inValue("min",0);
var max=op.inValue("max",1);
var result=op.outValue("result");

exe.onTriggered=genRandom;
max.onChange=genRandom;
min.onChange=genRandom;

genRandom();

function genRandom()
{
    result.set( (Math.random()*(max.get()-min.get()))+min.get());
}
