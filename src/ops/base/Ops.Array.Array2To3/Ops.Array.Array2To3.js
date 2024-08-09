const
    inArr = op.inArray("Array2x", 2),
    outArr = op.outArray("Array3x", 3),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length");

let arr = [];
let showingError = false;

inArr.onChange = function ()
{
    let theArray = inArr.get();
    if (!theArray)
    {
        outArr.set(null);
        return;
    }

    if (theArray.length % 2 != 0)
    {
        if (!showingError)
        {
            op.setUiError("warning", "Arrays length not divisible by 2!");
            showingError = true;
        }
        outArr.set(null);
        outTotalPoints.set(0);
        outArrayLength.set(0);
        return;
    }
    if (showingError)
    {
        showingError = false;
        op.setUiError("warning", null);
    }

    if ((theArray.length / 2) * 3 != arr.length)
    {
        arr.length = (theArray.length / 2) * 3;
    }

    for (let i = 0; i < theArray.length / 2; i++)
    {
        arr[i * 3 + 0] = theArray[i * 2 + 0];
        arr[i * 3 + 1] = theArray[i * 2 + 1];
        arr[i * 3 + 2] = 0;
    }

    outArr.setRef(arr);
    outTotalPoints.set(arr.length / 3);
    outArrayLength.set(arr.length);
};
