let inArr = op.inArray("Array2x");
let outArr = op.outArray("Array3x");

let arr = [];

inArr.onChange = function ()
{
    let theArray = inArr.get();
    if (!theArray) return;

    if ((theArray.length / 2) * 3 != arr.length)
    {
        arr.length = (theArray.length / 2) * 3;
    }

    for (let i = 0; i < theArray.length / 2; i++)
    {
        arr[i * 3 + 0] = theArray[i + 0];
        arr[i * 3 + 1] = i;
        arr[i * 3 + 2] = 0;
    }

    outArr.setRef(arr);
};
