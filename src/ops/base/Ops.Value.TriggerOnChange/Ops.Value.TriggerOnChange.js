
var inval=op.inValue("Value");

var next=op.outFunction("Next");

inval.onChange=function()
{
    next.trigger();
};