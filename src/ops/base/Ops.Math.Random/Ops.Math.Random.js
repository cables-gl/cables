
var exe=op.inFunctionButton('exe');
var minusPlusOne=op.addInPort(new Port(op,"0 to x / -x to x ",OP_PORT_TYPE_VALUE,{display:'bool'}));
var max=op.inValue("max",1);
var seed=op.inValue("random seed",0);
var result=op.outValue("result");

exe.onTriggered=calcRandom;
seed.onChange=calcRandom;
max.onChange=calcRandom;

calcRandom();

var oldSeed=0;
function calcRandom()
{
    oldSeed=Math.randomSeed;
    Math.randomSeed=seed.get();
    if(minusPlusOne.get()) result.set((Math.seededRandom()*max.get())*2-max.get() );
        else result.set(Math.seededRandom()*max.get());
        
    Math.randomSeed=oldSeed;
}

