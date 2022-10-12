const
    inIndex = op.inValue("Index Position"),
    inArr = op.inArray("Array"),
    outX = op.outNumber("result");

inIndex.onChange = inArr.onChange = function ()
{
    let i = Math.floor(inIndex.get());
    let fr = inIndex.get() - Math.floor(inIndex.get());
    let arr = inArr.get();

    if (i < 0 || !arr)
    {
        return;
    }

    if (i >= arr.length - 1)
    {
        outX.set(arr[arr.length - 1]);
        return;
    }

    let x = arr[i + 0];

    let x2 = arr[i + 1];

    x += (x2 - x) * fr;

    outX.set(x);
};
