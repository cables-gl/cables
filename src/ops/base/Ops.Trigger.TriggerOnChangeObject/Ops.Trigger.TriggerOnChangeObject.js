const
    inval = op.inObject("Object"),
    next = op.outTrigger("Changed"),
    outArr = op.outObject("Result");

outArr.ignoreValueSerialize = true;

inval.onChange = function ()
{
    outArr.setRef(inval.get());
    next.trigger();
};
