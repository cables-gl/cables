const
    str=op.inStringEditor("JSON String",'{}'),
    outObj=op.outObject("Result"),
    isValid=op.outValue("Valid");

str.onChange=parse;
parse();

function parse()
{
    try
    {
        var obj=JSON.parse(str.get());
        outObj.set(null);
        outObj.set(obj);
        isValid.set(true);
        op.setError("invalidjson",null);
    }
    catch(ex)
    {
        console.log(ex);
        isValid.set(false);
        op.setError("invalidjson","INVALID JSON<br/> can not parse string to object:<br/><b> "+ex.message+'</b>');
    }
}