const
    inArrays = op.inMultiPort2("Arrays", CABLES.OP_PORT_TYPE_ARRAY),
    outArr = op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

let arr = [];

inArrays.onChange = update;

function update()
{
    const arrayPorts = inArrays.get();

    arr.length = 0;

    for (let i = 0; i < arrayPorts.length; i++)
    {
        const ar = arrayPorts[i].get();
        if (ar)arr = arr.concat(ar);
    }

    outArr.setRef(arr);
    outArrayLength.set(arr.length);
}
