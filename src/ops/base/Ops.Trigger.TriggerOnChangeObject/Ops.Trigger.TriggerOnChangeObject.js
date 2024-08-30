const
    inval = op.inObject("Object"),
    next = op.outTrigger("Changed"),
    outObj = op.outObject("Result");

outObj.ignoreValueSerialize = true;

inval.onChange = function ()
{
    outObj.setRef(inval.get());
    next.trigger();
};
