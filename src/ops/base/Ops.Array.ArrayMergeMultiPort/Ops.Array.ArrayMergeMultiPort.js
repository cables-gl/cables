const
    inArrays = op.inMultiPort2("Arrays", CABLES.OP_PORT_TYPE_ARRAY),
    outArr = op.outArray("Result"),
    outGroups = op.outArray("Groups"),
    outArrayLength = op.outNumber("Array length");

let arr = [];
let arrGroups = [];

inArrays.onChange = update;

function update()
{
    const arrayPorts = inArrays.get();

    arr.length = 0;
    arrGroups.length = 0;

    for (let i = 0; i < arrayPorts.length; i++)
    {
        const ar = arrayPorts[i].get();
        if (ar) arr = arr.concat(ar);
        if (ar)
        {

            const garr = [];
            garr.length = ar.length;
            garr.fill(i);
            arrGroups = arrGroups.concat(garr);
        }
    }

    outArr.setRef(arr);
    outGroups.setRef(arrGroups);
    outArrayLength.set(arr.length);
}
