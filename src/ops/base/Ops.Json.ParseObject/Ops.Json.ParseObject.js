const str=op.inValueEditor("JSON String",'{}');
const outObj=op.outObject("Result");
const isValid=op.outValue("Valid");

str.onChange=parse;
parse();

function parse()
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
}