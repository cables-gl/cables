const
    inArray = op.inArray("Array In"),
    inMinValue = op.inFloat("Min", 0.0),
    inMaxValue = op.inFloat("Max", 1.0),
    outArray = op.outArray("Array Out");

let newArr = [];
outArray.set(newArr);
inArray.onChange = inMinValue.onChange = inMaxValue.onChange = function ()
{
    const arr = inArray.get();
    if (!arr) return;

    const inMin = inMinValue.get();
    const inMax = inMaxValue.get();

    if (newArr.length != arr.length)newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++)
    {
        newArr[i] = Math.min(Math.max(arr[i], inMin), inMax);
    }

    outArray.setRef(newArr);
};
