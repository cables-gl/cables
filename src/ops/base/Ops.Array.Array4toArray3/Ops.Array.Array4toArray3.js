const
    inArr = op.inArray("Array", 4),
    result = op.outArray("Result", 3),
    outArrayLength = op.outNumber("Array length");

let arr = [];
inArr.onChange = function ()
{
    let ia = inArr.get();
    if (!ia)
    {
        result.set([]);
        outArrayLength.set(0);
        return;
    }

    arr.length = ia.length / 4 * 3;

    for (let i = 0; i < ia.length; i += 4)
    {
        let ind = (i / 4) * 3;
        arr[ind + 0] = ia[i];
        arr[ind + 1] = ia[i + 1];
        arr[ind + 2] = ia[i + 2];
    }

    result.set(null);
    result.set(arr);
    outArrayLength.set(arr.length);
};
