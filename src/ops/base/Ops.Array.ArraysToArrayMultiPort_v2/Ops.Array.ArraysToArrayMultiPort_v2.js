const
    inArrays = op.inMultiPort2("Arrays", CABLES.Port.TYPE_ARRAY),
    outArr = op.outArray("Result"),
    outNum = op.outNumber("Num Values");

inArrays.onChange = () =>
{
    const arrayPorts = inArrays.get();
    let arr = [];

    for (let i = 0; i < arrayPorts.length; i++)
        arr[i] = arrayPorts[i].get() || [];

    outArr.setRef(arr);
    outNum.set(arrayPorts.length);
};
