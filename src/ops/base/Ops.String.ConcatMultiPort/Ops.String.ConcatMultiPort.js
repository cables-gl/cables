const
    inSep = op.inSwitch("Seperator", ["None", "LineBreak", "Space", ",", "/"], "None"),
    inStrs = op.inMultiPort("Strings", CABLES.OP_PORT_TYPE_STRING),
    outStr = op.outString("String"),
    outNum = op.outNumber("Num Strings");

inSep.onChange =
inStrs.onChange = () =>
{
    const stringPorts = inStrs.get();
    let str = "";

    let sep = "";

    if (inSep.get() == "None") sep = "";
    else if (inSep.get() == "LineBreak")sep = "\n";
    else if (inSep.get() == "Space")sep = " ";
    else sep = inSep.get();

    for (let i = 0; i < stringPorts.length; i++)
    {
        str += stringPorts[i].get() || "";
        if (i != stringPorts.length - 1)str += sep;
    }
    outStr.set(str);
    outNum.set(stringPorts.length);
};
