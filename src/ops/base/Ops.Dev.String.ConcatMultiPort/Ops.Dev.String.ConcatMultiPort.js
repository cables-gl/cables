const
    inStrs = op.inMultiPort("Strings", CABLES.OP_PORT_TYPE_STRING),
    outStr = op.outString("String");

inStrs.onChange = () =>
{
    const stringPorts = inStrs.get();
    let str = "";

    for (let i = 0; i < stringPorts.length; i++)
    {
        str += stringPorts[i].get() || "";
    }

    outStr.set(str);
};
