const
    inStr = op.inString("String", ""),
    outStr = op.outString("Result");

inStr.onChange = function ()
{
    outStr.set((inStr.get() || "").replace(/(<([^>]+)>)/ig, ""));
};
