const
    inStrs = op.inMultiPort("Numbers", CABLES.OP_PORT_TYPE_NUMBER),
    outResult = op.outNumber("Number"),
    outNum = op.outNumber("Num Values");

inStrs.onChange = () =>
{
    let sum = 0;
    const valuePorts = inStrs.get();
    for (let i = 0; i < valuePorts.length; i++)
    {
        sum += valuePorts[i].get();
    }
    outNum.set(sum);
};
