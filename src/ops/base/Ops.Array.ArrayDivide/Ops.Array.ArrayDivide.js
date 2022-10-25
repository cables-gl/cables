let inArray = op.inArray("Array In");
let inValue = op.inValue("Value", 1.0);
let outArray = op.outArray("Array Out");

let newArr = [];
outArray.set(newArr);
inArray.onChange = inValue.onChange = inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let divide = inValue.get();

    if (newArr.length != arr.length) newArr.length = arr.length;

    let i = 0;
    for (i = 0; i < arr.length; i++)
    {
        newArr[i] = arr[i] / divide;
    }
    outArray.set(null);
    outArray.set(newArr);
};
