const
    inStrs = op.inMultiPort2("Numbers", CABLES.Port.TYPE_NUMBER),
    outArr = op.outArray("Result"),
    outNum = op.outNumber("Num Values");

inStrs.onChange = () =>
{
    const numberPorts = inStrs.get();
    let arr = [];

    for (let i = 0; i < numberPorts.length; i++)
    {
        arr[i] = parseFloat(numberPorts[i].get()) || 0;
    }
    outArr.set(arr);
    outNum.set(numberPorts.length);
};
