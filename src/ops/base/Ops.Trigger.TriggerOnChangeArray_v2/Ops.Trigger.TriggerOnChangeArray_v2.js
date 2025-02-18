const
    inval = op.inArray("Array"),
    next = op.outTrigger("Changed"),
    outArr = op.outArray("Result");

inval.onChange = function ()
{
    outArr.set(inval.get());
    next.trigger();
};

op.init = () =>
{
    if (inval.get())next.trigger();
};
