const
    val=op.inValue("Value"),
    result=op.outValue("Result",false);

val.onChange=function()
{
    result.set(val.get()==1);
};