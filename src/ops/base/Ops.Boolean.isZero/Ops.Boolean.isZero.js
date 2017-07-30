op.name="isZero";

var val=op.inValue("Value");
var result=op.outValue("Result",true);

val.onChange=function()
{
    if(val.get()==0)result.set(true);
        else result.set(false);
};