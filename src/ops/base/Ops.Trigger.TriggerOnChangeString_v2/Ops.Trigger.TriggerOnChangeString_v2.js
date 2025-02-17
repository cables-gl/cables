const
    inval = op.inString("String"),
    next = op.outTrigger("Changed"),
    outStr = op.outString("Result");

outStr.ignoreValueSerialize = true;

inval.onChange = function ()
{
    outStr.set(inval.get());
    next.trigger();
};

op.init = () =>
{
    if (inval.isLinked())next.trigger();
};
