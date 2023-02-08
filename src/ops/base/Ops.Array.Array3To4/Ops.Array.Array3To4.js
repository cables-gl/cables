const
    inArr = op.inArray("Array3x", 3),
    outArr = op.outArray("Array4x", 4),
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

    if (theArray.length % 3 != 0)
    {
        if (!showingError)
        {
            op.uiAttr({ "error": "Arrays length not divisible by 3 !" });
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
        op.uiAttr({ "error": null });
    }

    if ((theArray.length / 3) * 4 != arr.length)
    {
        arr.length = (theArray.length / 3) * 4;
    }

    for (let i = 0; i < theArray.length / 3; i++)
    {
        arr[i * 4 + 0] = theArray[i * 3 + 0];
        arr[i * 4 + 1] = theArray[i * 3 + 1];
        arr[i * 4 + 2] = theArray[i * 3 + 2];
        arr[i * 4 + 3] = 1;
    }

    outArr.setRef(arr);
    outTotalPoints.set(arr.length / 4);
    outArrayLength.set(arr.length);
};
