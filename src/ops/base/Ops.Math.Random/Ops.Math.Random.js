
op.name='random';

var exe=op.inFunction('exe');
var minusPlusOne=op.addInPort(new Port(op,"0 to x / -x to x ",OP_PORT_TYPE_VALUE,{display:'bool'}));
var max=op.inValue("max",1);
var result=op.outValue("result");

exe.onTriggered=calcRandom;
max.onChange=calcRandom;

calcRandom();

function calcRandom()
{
    if(minusPlusOne.get()) result.set((Math.random()*max.get())*2-max.get()/2);
        else result.set(Math.random()*max.get());
}

