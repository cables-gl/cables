const arrayIn = op.inArray("Array to sort"),
    sortMode = op.inSwitch("Sorting mode", ["Sort ascending", "Sort descending"], "Sort ascending"),
    arrayOut = op.outArray("Sorted array");
let arrOut = [];

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

    let i;
    for (i = 0; i < arrIn.length; i++)
    {
        arrOut[i] = arrIn[i];
    }

    if (sortMode.get() === "Sort ascending")
    {
        arrOut.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
    }
    else
    {
        arrOut.sort(function (a, b) { return a > b ? -1 : a < b ? 1 : 0; });
    }

    arrayOut.set(null);
    arrayOut.set(arrOut);
}
