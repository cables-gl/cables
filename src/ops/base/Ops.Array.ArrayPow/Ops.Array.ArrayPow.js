// The pow function will not work correctly with neagtive numbers
// Use the ArrayAbs op to make numbers have only positive values
// to work correctly with this op

let inArray = op.inArray("Array in");
let inValue = op.inValue("Pow factor", 1.0);
let outArray = op.outArray("Array out");

let newArr = [];
outArray.set(newArr);

inArray.onChange =
inValue.onChange = inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let pow = inValue.get();
    if (pow < 0.0)
    {
        pow = 0.0;
    }

    if (newArr.length !== arr.length)newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++)
    {
        newArr[i] = Math.pow(arr[i], pow);
    }
    outArray.set(null);
    outArray.set(newArr);
};
