const
    value=op.inValue("Value"),
    result=op.outValue("Result");

value.onChange=function()
{
    const v=value.get();
    result.set(v-Math.floor(v));
};