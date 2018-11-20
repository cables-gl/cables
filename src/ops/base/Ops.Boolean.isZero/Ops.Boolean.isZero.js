const
    val=op.inValue("Value"),
    result=op.outValue("Result",true);

val.onChange=function()
{
    result.set(val.get()==0);
};