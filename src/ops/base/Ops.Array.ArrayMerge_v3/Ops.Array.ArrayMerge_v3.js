const numArrays = 8;
const inArrs = [];

for (let i = 0; i < numArrays; i++)
{
    inArrs[i] = op.inArray("Array " + i);
    inArrs[i].onChange = function ()
    {
        update();
    };
}

const
    outArr = op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

let arr = [];

function update()
{
    arr.length = 0;

    for (let i = 0; i < numArrays; i++)
    {
        const ar = inArrs[i].get();
        if (ar)arr = arr.concat(ar);
    }

    outArr.setRef(arr);
    outArrayLength.set(arr.length);
}
