const
    arrayIn = op.inArray("Array to sort"),
    sortMode = op.inSwitch("Sorting mode", ["Ascending", "Descending"], "Ascending"),
    arrayOut = op.outArray("Sorted array"),
    arrayOutIdx = op.outArray("Sorted Indices");

let arrOut = [];
let indices = [];

arrayIn.onChange = sortMode.onChange = update;
update();

function update()
{
    let arrIn = arrayIn.get();

    arrOut.length = 0;

    if (!arrIn)
    {
        arrayOut.set(null);
        return;
    }

    arrOut.length = arrIn.length;
    indices.length = arrIn.length;

    for (let i = 0; i < arrIn.length; ++i) indices[i] = i;

    for (let i = 0; i < arrIn.length; i++)
    {
        arrOut[i] = arrIn[i];
    }

    if (sortMode.get() === "Sort ascending")
    {
        indices.sort(function (a, b) { return arrOut[a] < arrOut[b] ? -1 : arrOut[a] > arrOut[b] ? 1 : 0; });
    }
    else
    {
        indices.sort(function (a, b) { return arrOut[a] > arrOut[b] ? -1 : arrOut[a] < arrOut[b] ? 1 : 0; });
    }

    arrayOut.setRef(arrOut);
    arrayOutIdx.setRef(indices);
}
