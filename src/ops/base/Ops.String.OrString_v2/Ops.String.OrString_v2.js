const
    inStrs = op.inMultiPort2("String", CABLES.Port.TYPE_STRING),
    outStr = op.outString("Result");

inStrs.onChange = () =>
{
    const stringPorts = inStrs.get();

    for (let i = 0; i < stringPorts.length; i++)
        stringPorts[i].setUiAttribs({ "arrow": false });

    for (let i = 0; i < stringPorts.length; i++)
    {
        if (stringPorts[i].get())
        {
            outStr.set(stringPorts[i].get());
            stringPorts[i].setUiAttribs({ "arrow": true });
            break;
        }
    }

};
