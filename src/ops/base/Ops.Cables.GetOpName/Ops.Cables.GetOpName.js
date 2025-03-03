const
    inId = op.inString("OpId", ""),
    outFound = op.outBoolNum("Found"),
    outName = op.outString("Name"),
    outShortName = op.outString("Shortname"),
    outVersion = op.outNumber("Version");

inId.onChange = () =>
{
    const op = CABLES.OPS[inId.get()];

    if (op)
    {
        outFound.set(true);
        outName.set(op.objName);

        let parts = op.objName.split(".");

        outShortName.set(parts[parts.length - 1]);

        parts = parts[parts.length - 1].split("_");

        if (parts[1])
        {
            outVersion.set(parseInt(parts[1].substr(1)));
        }
        else
        {
            outVersion.set(0);
        }
    }
    else
    {
        outFound.set(false);
    }
};
