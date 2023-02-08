const
    inArr = op.inArray("Array3x", 3),
    mulX = op.inValue("Mul X", 1),
    mulY = op.inValue("Mul Y", 1),
    mulZ = op.inValue("Mul Z", 1),
    outArr = op.outArray("Result");

let arr = [];

mulY.onChange = mulX.onChange = mulZ.onChange =
inArr.onChange = function ()
{
    let newArr = inArr.get();
    if (newArr)
    {
        if (arr.length != newArr.length)arr.length = newArr.length;

        for (let i = 0; i < newArr.length; i += 3)
        {
            arr[i + 0] = newArr[i + 0] * mulX.get();
            arr[i + 1] = newArr[i + 1] * mulY.get();
            arr[i + 2] = newArr[i + 2] * mulZ.get();
        }

        outArr.setRef(arr);
    }
    else
    {
        outArr.set(null);
    }
};
