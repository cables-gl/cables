var str=op.inValueEditor("JSON String");

var outObj=op.outObject("Result");

var isValid=op.outValue("Valid");

str.onChange=function()
{
    try
    {
        var obj=JSON.parse(str.get());
        outObj.set(obj);
        isValid.set(true);
    }
    catch(ex)
    {
        console.log(ex);
        isValid.set(false);
    }
    
};