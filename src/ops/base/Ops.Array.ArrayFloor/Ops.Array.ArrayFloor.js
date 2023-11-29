const inArray = op.inArray("In"),
    outArray = op.outArray("Result"),
    newArr = [];

outArray.set(newArr);

inArray.onChange = function ()
{
    let arr = inArray.get();

    if (!arr)
    {
        outArray.set(null);
        return;
    }

    if (newArr.length != arr.length)newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++)
    {
        newArr[i] = Math.floor(arr[i]);
    }
    outArray.setRef(newArr);
};
