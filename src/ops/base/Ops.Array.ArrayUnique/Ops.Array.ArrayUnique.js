const inArray = op.inArray("In");
const outArray = op.outArray("Result");

const newArr = [];
outArray.set(newArr);

inArray.onChange = function ()
{
    const arr = inArray.get();

    if (!arr) return;

    if (newArr.length != arr.length) newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++)
    {
        newArr[i] = Math.abs(arr[i]);
    }
    outArray.set(null);
    outArray.set(newArr);
};
