const
    inStr = op.inValueString("String"),
    outStr = op.outNumber("Result");

inStr.onChange = function ()
{
    if (!inStr.get())outStr.set("");
    else outStr.set(inStr.get().toUpperCase());
};
