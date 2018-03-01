var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var number=op.addInPort(new Port(op,"number"));
var max=op.addInPort(new Port(op,"max"));
var numOut=op.addInPort(new Port(op,"num outputs"));
var num=op.addOutPort(new Port(op,"num",OP_PORT_TYPE_VALUE));

number.set(0);
max.set(1);
numOut.set(2);
num.set(0);

var triggers=[];
var numTriggers=20;

var trigger=function()
{
    var s=max.get()/numOut.get();
    var index=Math.abs(Math.floor(number.get()/s));
    
    num.set(index);
    
    if(!isNaN(index) && index<numTriggers)
    {
        triggers[index].trigger();
    }
};

exe.onTriggered=trigger;


for(var i=0;i<numTriggers;i++)
{
    triggers.push( op.addOutPort(new Port(op,"trigger "+i,OP_PORT_TYPE_FUNCTION)) );
}
