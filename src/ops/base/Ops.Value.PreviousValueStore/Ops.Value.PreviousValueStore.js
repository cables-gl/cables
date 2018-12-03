var val=op.addInPort(new CABLES.Port(op,"Value"));
var outCurrent=op.outValue("Current Value");
var outOldVal=op.outValue("Previous Value");


var oldValue=0;

val.onChange=function()
{
    outOldVal.set(oldValue);
    oldValue=val.get();
    outCurrent.set(val.get());
};

