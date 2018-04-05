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
        op.error("invalidjson",null);
    }
    catch(ex)
    {
        console.log(ex);
        isValid.set(false);
        op.error("invalidjson","INVALID JSON<br/> can not parse string to object:<br/><b> "+ex.message+'</b>');
    }
};