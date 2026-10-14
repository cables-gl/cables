var inStr=op.inValueString("String");
var result=op.outNumber("Result");

inStr.onChange=
function()
{
    if(!inStr.get())
    {
        result.set(-1);
    }
    else
    {
        result.set( inStr.get().length );
    }
};