const
    inStr = op.inString("String"),
    inRepl = op.inString("Replace", ","),
    outStr = op.outString("Result");

inRepl.onChange =
    inStr.onChange = update;

function update()
{
    op.setUiError("exception", null);

    let str = inStr.get();
    try
    {
        str = str.replace(/\D/g, "x");
        while (str.indexOf("xx") > -1) str = str.replaceAll("xx", "x");
        str = str.replaceAll("x", inRepl.get());
    }
    catch (e)
    {
        op.setUiError("exception", "exception " + e.message);
    }

    outStr.set(str);
}
