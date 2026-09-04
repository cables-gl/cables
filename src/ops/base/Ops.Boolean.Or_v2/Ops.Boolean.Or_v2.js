const
    inPorts = op.inMultiPort2("Booleans", CABLES.Port.TYPE_NUMBER, { "display": "bool" }, 6),
    outResult = op.outNumber("Result");

inPorts.onChange = () =>
{
    const valuePorts = inPorts.get();
    for (let i = 0; i < valuePorts.length; i++)
    {
        if (valuePorts[i].get()) return outResult.set(true);
    }
    outResult.set(false);
};
