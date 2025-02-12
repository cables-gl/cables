const
    inJs = op.inString("JS Expression", "document.body.clientWidth"),
    outStr = op.outString("Result String"),
    outNum = op.outNumber("Result Number"),
    outArr = op.outArray("Result Array"),
    outObj = op.outObject("Result Object"),
    outErr = op.outBoolNum("Error");

inJs.onChange = update;
update();

function update()
{
    outErr.set(false);
    try
    {
        const a = eval("\"use strict\";" + inJs.get());

        if (CABLES.isNumeric(a))
        {
            outNum.set(a);
            outStr.set(a + "");
        }
        else if (typeof a === "string")
        {
            outNum.set(0);
            outStr.set(a);
        }
        else if (Array.isArray(a))
        {
            outNum.set(0);
            outStr.set("");
            outObj.set(null);
            outArr.set(a);
        }
        else if (typeof a === "object")
        {
            outArr.set(null);
            outNum.set(0);
            outStr.set("");
            outObj.set(a);
        }
    }
    catch (e)
    {
        outErr.set(true);
        op.logWarn("error", e);
    }
}
