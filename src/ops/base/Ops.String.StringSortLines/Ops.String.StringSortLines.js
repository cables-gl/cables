const
    inStr = op.inString("String", ""),
    inReverse = op.inBool("Reverse", false),
    outStr = op.outString("Result");

inReverse.onChange =
inStr.onChange = () =>
{
    const str = inStr.get();
    if (!str)
    {
        outStr.set("");
        return;
    }

    let parts = str.split("\n");
    parts = parts.sort();
    if (inReverse.get()) parts = parts.reverse();

    outStr.set(parts.join("\n"));
};
