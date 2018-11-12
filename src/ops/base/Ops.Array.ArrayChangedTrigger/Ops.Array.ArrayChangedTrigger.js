
var inArr=op.inArray("Array");
var next=op.outTrigger("Changed Trigger");

inArr.onChange=function()
{
    next.trigger();
    
};