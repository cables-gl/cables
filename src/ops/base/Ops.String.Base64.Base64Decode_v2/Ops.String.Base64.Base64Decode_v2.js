let r = "";
const
    inString = op.inString("String"),
    result = op.outString("Result");
inString.onChange = function ()
{
    result.set(b64DecodeUnicode(inString.get() || ""));
};

function b64DecodeUnicode(str)
{
    // Going backwards: from bytestream, to percent-encoding, to original string.

    if (str.indexOf("base64,") > 1)
    {
        str = str.substring(str.indexOf("base64,") + "base64,".length);
    }

    let r = "";

    try
    {
        r = decodeURIComponent(atob(str).split("").map(function (c)
        {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
    }
    catch (e)
    {
        op.error(e);
    }

    return r;
}
