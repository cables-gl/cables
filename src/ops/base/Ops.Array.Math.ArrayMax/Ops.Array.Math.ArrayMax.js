const inArray = op.inArray("Array In");
const inValue = op.inValue("Value", 1.0);
const outArray = op.outArray("Array Out");

let newArr = [];
outArray.set(newArr);
op.toWorkPortsNeedToBeLinked(inArray);

inValue.onChange = inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let inMax = inValue.get();

    if (newArr.length != arr.length)newArr.length = arr.length;

    let i = 0;
    for (i = 0; i < arr.length; i++)
    {
        newArr[i] = Math.max(arr[i], inMax);
    }
    outArray.setRef(newArr);
};
