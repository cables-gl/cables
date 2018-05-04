var divisor=5;

var exec=op.inFunction("Update");
var inVal=op.inValue("Value");

var next=op.outFunction("Next");
var inDivisor=op.inValue("Divisor",divisor);
var result=op.outValue("Result",0);

var val=0;
var goal=0;

var oldVal=0;
var lastTrigger=0;

inVal.onChange=function()
{
    goal=inVal.get();
};

inDivisor.onChange=function()
{
    divisor=inDivisor.get();
    if(divisor<=0)divisor=5;
};


exec.onTriggered=function()
{
    var tm=1;
    if(CABLES.now()-lastTrigger>500 || lastTrigger==0)val=inVal.get();
    else tm=(CABLES.now()-lastTrigger)/16;

    lastTrigger=CABLES.now();

    if(divisor<=0)divisor=0.0001;
    val=val+(goal-val)/(divisor*tm);

    if(val>0 && val<0.000000001)val=0;
    if(divisor!=divisor)val=0;
    
    if(oldVal!=val)
    {
        result.set(val);
        oldVal=val;
    }
    
    next.trigger();
};