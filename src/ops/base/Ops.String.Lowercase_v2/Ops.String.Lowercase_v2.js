const
    inStr = op.inString("String"),
    outStr = op.outString("Result", "");

inStr.onChange = function ()
{
    if (inStr.get() == 0) outStr.set("");
    else outStr.set(String(inStr.get() || "").toLowerCase());
};
