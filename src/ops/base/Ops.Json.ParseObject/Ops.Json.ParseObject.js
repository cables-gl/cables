const str = op.inValueEditor("JSON String", "{}", "json");
const outObj = op.outObject("Result");
const isValid = op.outValue("Valid");

str.onChange = parse;
parse();

function parse()
{
    try
    {
        const obj = JSON.parse(str.get());
        outObj.set(null);
        outObj.set(obj);
        isValid.set(true);
        op.setUiError("invalidjson", null);
    }
    catch (ex)
    {
        console.log(ex);
        isValid.set(false);
        op.setUiError("invalidjson", "INVALID JSON<br/> can not parse string to object:<br/><b> " + ex.message + "</b>");
    }
}
