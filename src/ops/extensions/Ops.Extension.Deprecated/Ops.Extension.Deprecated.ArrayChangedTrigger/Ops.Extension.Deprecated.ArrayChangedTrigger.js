const
    inArr = op.inArray("Array"),
    next = op.outTrigger("Changed Trigger"),
    outArr = op.outArray("New Array");

inArr.onChange = function ()
{
    outArr.setRef(inArr.get());
    next.trigger();
};
