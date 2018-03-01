
var inObj1=op.inObject("Object1");
var inObj2=op.inObject("Object2");
var inObj3=op.inObject("Object3");
var inObj4=op.inObject("Object4");
var inObj5=op.inObject("Object5");

var outObj=op.outObject("Out Object");

inObj1.onChange=function()
{
    outObj.set(null);
    outObj.set(inObj1.get());
};

inObj2.onChange=function()
{
    outObj.set(null);
    outObj.set(inObj2.get());
};

inObj3.onChange=function()
{
    outObj.set(null);
    outObj.set(inObj3.get());
};

inObj4.onChange=function()
{
    outObj.set(null);
    outObj.set(inObj4.get());
};

inObj5.onChange=function()
{
    outObj.set(null);
    outObj.set(inObj5.get());
};