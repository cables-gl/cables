op.name="ArrayChangedTrigger";

var inArr=op.inArray("Array");
var next=op.outFunction("Changed Trigger");

inArr.onChange=function()
{
    next.trigger();
    
};