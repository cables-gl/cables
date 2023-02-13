const
    inStr = op.inStringEditor("String"),
    inIdx = op.inInt("Index", 0),

    outIdx = op.outNumber("Line"),
    outFound = op.outBoolNum("Found");

inStr.onChange = inIdx.onChange = () =>
{
    let str = inStr.get() || "";
    let idx = inIdx.get() || 0;
    let line = 0;

    if (idx < 0)idx = 0;

    let off = 0;
    let found = false;

    for (let i = 0; i < str.length; i++)
    {
        if (i == idx)
        {
            found = true;
            break;
        }
        if (str.charAt(i) == "\n")
        {
            line++;
            // off++;
        }
    }

    outFound.set(found);
    outIdx.set(line);
};
