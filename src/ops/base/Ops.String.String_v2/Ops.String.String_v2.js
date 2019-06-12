const
    v=op.inString("value",""),
    result=op.outString("String");

v.onChange=function()
{
    result.set(v.get());
};

