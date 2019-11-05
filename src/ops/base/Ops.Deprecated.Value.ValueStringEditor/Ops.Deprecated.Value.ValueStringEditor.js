var v=op.inValueEditor("value","");
var result=op.outValue("Result");

v.onChange=function()
{
    result.set(v.get());
};

