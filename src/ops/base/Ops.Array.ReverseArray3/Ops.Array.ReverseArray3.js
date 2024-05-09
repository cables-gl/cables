const
    inArr = op.inArray("Array"),
    outArr = op.outArray("Reversed Array", []);

inArr.onLinkChanged = () =>
{
    if (inArr) inArr.copyLinkedUiAttrib("stride", outArr);
};

// change listeners
inArr.onChange = function ()
{
    let arr = inArr.get();
    let reversedArr = [];
    if (arr && arr.length >= 3)
    {
        // in case the array is not dividable by 3, get rid of the rest
        // e.g. length = 31 -> ignore the last value
        //      length = 30 -> perfect fit for [x, y, z, ...]
        let iStart = (Math.floor(arr.length / 3) * 3) - 3;
        for (let i = iStart; i >= 0; i -= 3)
        {
            reversedArr.push(arr[i], arr[i + 1], arr[i + 2]);
        }
    }

    outArr.setRef(reversedArr);
};
