const
    inArr = op.inArray("Array"),
    inSeperator = op.inString("Seperator", ","),
    inPrefix = op.inString("Prefix", ""),
    inNewLine = op.inValueBool("New Line"),
    outStr = op.outString("Result");

inArr.onChange = inPrefix.onChange =
    outStr.onChange =
    inSeperator.onChange =
    inNewLine.onChange = exec;

function exec()
{
    let arr = inArr.get();
    let result = "";

    let sep = inSeperator.get();
    if (inNewLine.get())sep += "\n";
    sep += inPrefix.get();

    if (arr && arr.join)
    {
        result = inPrefix.get() + arr.join(sep);
    }

    outStr.set(result);
}
