const
    inArr = op.inArray("Array"),
    inStride = op.inInt("Stride", 6),
    outArr = op.outArray("Result");

inArr.onChange = () =>
{
    const stride = inStride.get();
    const result = [];
    const arr = inArr.get();
    if (!arr) return outArr.set(null);

    let count = 0;
    for (let i = 0; i < arr.length; i += stride)
    {
        const newArr = [];
        for (let j = 0; j < stride; j++)
        {
            newArr[j] = arr[i + j] || 0;
        }
        result[count] = newArr;
        count++;
    }

    outArr.set(null);
    outArr.set(result);
};