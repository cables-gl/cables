op.name="ApproachInterpolation";

var exec=op.inFunction("Update");
var inVal=op.inValue("Value");

var val=0;
var goal=0;
var divisor=5;

var inDivisor=op.inValue("Divisor",divisor);
var result=op.outValue("Result",0);
var next=op.outFunction("Next");

inVal.onChange=function()
{
    goal=inVal.get();
};

inDivisor.onChange=function()
{
    divisor=inDivisor.get();
};

exec.onTriggered=function()
{
    val=val+(goal-val)/divisor;
    
    if(val>0 && val<0.000000001)val=0;
    if(divisor!=divisor)val=0;
    result.set(val);
    
    next.trigger();
    
};