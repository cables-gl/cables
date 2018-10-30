
var inval=op.inValue("Value");

var next=op.outTrigger("Next");

inval.onChange=function()
{
    next.trigger();
};