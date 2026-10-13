const inArr = op.inArray("Array"),
    outArr = op.outArray("Result");

inArr.onChange = function ()
{
    var arr = inArr.get();
    outArr.set(null);

    if (!arr)
    {
        return;
    }

    let newArr;
    if (Array.isArray(arr)) newArr = arr.flat(Infinity);
    else newArr = Array.from(arr);

    outArr.set(newArr);

};
