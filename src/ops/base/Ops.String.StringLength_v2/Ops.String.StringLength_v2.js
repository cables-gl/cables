const
    inStr = op.inString("String"),
    result = op.outValue("Result");

inStr.onChange = function ()
{
    if (!inStr.get()) result.set(0);
    else result.set(String(inStr.get()).length);
};
