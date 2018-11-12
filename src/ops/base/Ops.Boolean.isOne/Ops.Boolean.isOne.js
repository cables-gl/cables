var val=op.inValue("Value");
var result=op.outValue("Result",false);

val.onChange=function()
{
    if(val.get()==1)result.set(true);
        else result.set(false);
};