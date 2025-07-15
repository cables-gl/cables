const
    inStr = op.inString("String Input", ""),
    outStr = op.outString("String Output");

inStr.onChange = () =>
{
    let str = inStr.get();
    if (str && str.startsWith("data:"))str = str.substring(str.indexOf(",") + 1);
    outStr.set(str);
};
