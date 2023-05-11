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

    if (sortMode.get() === "Ascending")
    {
        indices.sort(function (a, b) { return arrIn[a] < arrIn[b] ? -1 : arrIn[a] > arrIn[b] ? 1 : 0; });
    }
    else
    {
        indices.sort(function (a, b) { return arrIn[a] > arrIn[b] ? -1 : arrIn[a] < arrIn[b] ? 1 : 0; });
    }

    for (let i = 0; i < arrIn.length; i++)
    {
        arrOut[i] = arrIn[indices[i]];
    }

    arrayOut.setRef(arrOut);
    arrayOutIdx.setRef(indices);
}
