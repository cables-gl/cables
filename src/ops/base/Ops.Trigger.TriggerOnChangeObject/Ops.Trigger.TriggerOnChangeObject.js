const
    inval = op.inObject("Object"),
    next = op.outTrigger("Changed"),
    outArr = op.outObject("Result");

inval.onChange = function ()
{
    outArr.set(inval.get());
    next.trigger();
};
