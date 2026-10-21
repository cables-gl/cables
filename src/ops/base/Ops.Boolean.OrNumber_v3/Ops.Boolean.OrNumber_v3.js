const
    inStrs = op.inMultiPort2("Number ", CABLES.Port.TYPE_NUMBER),
    outStr = op.outNumber("Result");

inStrs.onChange = () =>
{
    const numberPorts = inStrs.get();

    for (let i = 0; i < numberPorts.length; i++)
        numberPorts[i].setUiAttribs({ "arrow": false });

    for (let i = 0; i < numberPorts.length; i++)
    {
        if (numberPorts[i].get())
        {
            outStr.set(numberPorts[i].get());
            numberPorts[i].setUiAttribs({ "arrow": true });
            break;
        }
    }

};
