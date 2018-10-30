var value=op.inValue("Value");
var result=op.outValue("Result");

value.onChange=function()
{
    result.set(value.get()-Math.floor(value.get()));
};