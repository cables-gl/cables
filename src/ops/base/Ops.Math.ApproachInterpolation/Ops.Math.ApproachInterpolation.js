//look at http://sol.gfxile.net/interpolation/

var divisor=5;

var exec=op.inTrigger("Update");
var inVal=op.inValue("Value");

var next=op.outTrigger("Next");
var inDivisor=op.inValue("Divisor",divisor);
var result=op.outValue("Result",0);

var val=0;
var goal=0;

var lastTrigger=0;

inVal.onChange=function()
{
    goal=inVal.get();
};

inDivisor.onChange=function()
{
    divisor=inDivisor.get();
    if(divisor==0)divisor=5;
};

var oldVal=0;

exec.onTriggered=function()
{
    
    if(CABLES.now()-lastTrigger>500)val=inVal.get();
    lastTrigger=CABLES.now();


    if(divisor<=0)divisor=0.0001;
    val=val+(goal-val)/divisor;

    if(val>0 && val<0.000000001)val=0;
    if(divisor!=divisor)val=0;
    
    if(oldVal!=val)
    {
        result.set(val);
        oldVal=val;
    }
    
    next.trigger();
};