const
    inStrs = op.inMultiPort("Strings", CABLES.OP_PORT_TYPE_STRING),
    outStr = op.outString("String"),
    outNum = op.outNumber("Num Strings");

inStrs.onChange = () =>
{
    const stringPorts = inStrs.get();
    let str = "";

    for (let i = 0; i < stringPorts.length; i++)
    {
        str += stringPorts[i].get() || "";
    }
    outStr.set(str);
    outNum.set(stringPorts.length);
};
