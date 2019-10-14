const
    inArr=op.inArray("Array"),
    next=op.outTrigger("Changed Trigger"),
    outArr=op.outArray("New Array");

inArr.onChange=function()
{
    outArr.set(inArr.get());
    next.trigger();

};