const str = op.inValueEditor("JSON String", "{}", "json"),
    outObj = op.outObject("Result"),
    isValid = op.outValue("Valid");

str.onChange = parse;
parse();

function parse()
{
    try
    {
        const obj = JSON.parse(str.get());
        // outObj.set(null);
        outObj.setRef(obj);
        isValid.set(true);
        op.setUiError("invalidjson", null);
    }
    catch (ex)
    {
        op.logWarn(ex);
        isValid.set(false);
        op.setUiError("invalidjson", "INVALID JSON<br/> can not parse string to object:<br/><b> " + ex.message + "</b>");
    }
}
