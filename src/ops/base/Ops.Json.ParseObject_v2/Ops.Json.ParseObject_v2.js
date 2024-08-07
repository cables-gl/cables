const
    str = op.inStringEditor("JSON String", "{}", "json"),
    outObj = op.outObject("Result"),
    isValid = op.outBoolNum("Valid");

str.onChange = parse;
parse();

function parse()
{
    if (!str.get())
    {
        outObj.set(null);
        isValid.set(false);
        return;
    }
    try
    {
        const obj = JSON.parse(str.get());
        outObj.setRef(obj);
        isValid.set(true);
        op.setUiError("invalidjson", null);
    }
    catch (ex)
    {
        op.logWarn(ex);
        isValid.set(false);

        let outStr = "";
        const parts = ex.message.split(" ");
        for (let i = 0; i < parts.length - 1; i++)
        {
            const num = parseFloat(parts[i + 1]);
            if (num && parts[i] == "position")
            {
                const outStrA = str.get().substring(num - 15, num);
                const outStrB = str.get().substring(num, num + 1);
                const outStrC = str.get().substring(num + 1, num + 15);
                outStr = "<span style=\"font-family:monospace;background-color:black;\">" + outStrA + "<span style=\"font-weight:bold;background-color:red;\">" + outStrB + "</span>" + outStrC + " </span>";
            }
        }

        op.setUiError("invalidjson", "INVALID JSON<br/>can not parse string to object:<br/><b> " + ex.message + "</b><br/>" + outStr);
    }
}
