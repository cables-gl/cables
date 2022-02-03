let inArr = op.inArray("Array3x", 3);
let outArr = op.outArray("Array2x", 2);

let arr = [];

inArr.onChange = function ()
{
    let theArray = inArr.get();
    if (!theArray || (theArray.length / 3) % 1.0 != 0)
    {
        return;
    }
    if (!theArray) return;

    if ((theArray.length / 3) * 2 != arr.length)
    {
        arr.length = (theArray.length / 3) * 2;
    }

    for (let i = 0; i < theArray.length / 3; i++)
    {
        arr[i * 2 + 0] = theArray[i * 3 + 0];
        arr[i * 2 + 1] = theArray[i * 3 + 1];
    }

    outArr.set(null);
    outArr.set(arr);
};
