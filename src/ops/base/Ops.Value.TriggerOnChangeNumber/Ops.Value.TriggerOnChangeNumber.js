const
    inval=op.inValue("Value"),
    next=op.outTrigger("Next");

inval.onChange=function()
{
    next.trigger();
};