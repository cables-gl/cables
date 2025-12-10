const
    inArrays = op.inMultiPort("Arrays", CABLES.OP_PORT_TYPE_ARRAY),
    outArr = op.outArray("Result"),
    outNum = op.outNumber("Num Values");

inArrays.onChange = () =>
{
    const arrayPorts = inArrays.get();
    let arr = [];

    for (let i = 0; i < arrayPorts.length; i++)
        arr[i] = arrayPorts[i].get() || [];

    outArr.set(arr);
    outNum.set(arrayPorts.length);
};
