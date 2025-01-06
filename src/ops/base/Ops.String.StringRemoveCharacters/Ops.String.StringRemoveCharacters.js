const
    inStr = op.inString("String"),
    inChars = op.inString("Characters"),
    inReplace = op.inString("Replace"),
    result = op.outString("Result");

inChars.onChange =
inStr.onChange = () =>
{
    let str = inStr.get() || "";
    const chars = inChars.get();
    const rep = inReplace.get();
    for (let i = 0; i < chars.length; i++)
    {
        str = str.replaceAll(chars[i], rep);
    }
    result.set(str);
};
