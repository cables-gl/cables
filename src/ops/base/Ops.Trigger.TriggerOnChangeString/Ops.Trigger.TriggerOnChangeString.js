const
    inval = op.inString("String"),
    next = op.outTrigger("Changed"),
    outStr = op.outString("Result");

outStr.ignoreValueSerialize = true;

inval.onChange = function ()
{
    console.log("STRING CHANGED!!!", next.isLinked());

    outStr.set(inval.get());
    next.trigger();
};
