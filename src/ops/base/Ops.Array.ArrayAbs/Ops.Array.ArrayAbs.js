let inArray = op.inArray("In");
let outArray = op.outArray("Result");

let newArr = [];
outArray.set(newArr);

inArray.onChange = function ()
{
    let arr = inArray.get();

    if (!arr) return;

    if (newArr.length != arr.length)newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++)
    {
        newArr[i] = Math.abs(arr[i]);
    }
    outArray.setRef(newArr);
};
