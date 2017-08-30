op.name="StringLength";

var inStr=op.inValueString("String");
var result=op.outValue("Result");

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