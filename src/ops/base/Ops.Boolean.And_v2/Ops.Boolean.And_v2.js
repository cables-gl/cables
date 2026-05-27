const
    inPorts = op.inMultiPort2("Booleans", CABLES.OP_PORT_TYPE_NUMBER, { "display": "bool" }),
    outResult = op.outBoolNum("Result");

inPorts.onChange = () =>
{
    const valuePorts = inPorts.get();
    for (let i = 0; i < valuePorts.length; i++)
    {
        if (!valuePorts[i].get()) return outResult.set(0);
    }
    outResult.set(1);
};
