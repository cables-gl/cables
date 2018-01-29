var inObj=op.inObject("Object");
var outArray=op.outArray("Array");

inObj.onChange=function()
{
    outArray.set(inObj.get());
};