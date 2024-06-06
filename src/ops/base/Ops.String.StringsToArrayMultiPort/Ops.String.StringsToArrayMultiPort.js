const
    inStrs = op.inMultiPort("Strings", CABLES.OP_PORT_TYPE_STRING),
    outArr = op.outArray("Result"),
    outNum = op.outNumber("Num Values");

inStrs.onChange = () =>
{
    const stringPorts = inStrs.get();
    let arr = [];

    for (let i = 0; i < stringPorts.length; i++)
    {
        arr[i] = stringPorts[i].get() || "";
    }
    outArr.set(arr);
    outNum.set(stringPorts.length);
};
