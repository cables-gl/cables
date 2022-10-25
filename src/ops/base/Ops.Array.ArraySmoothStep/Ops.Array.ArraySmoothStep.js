const
    inArray = op.inArray("Array In"),
    inMinimum = op.inValue("Min", 0.0),
    inMaximum = op.inValue("Max", 1.0),
    outArray = op.outArray("Array out");

let newArr = [];
outArray.set(newArr);

inArray.onChange =
inMinimum.onChange =
inMaximum.onChange = inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let min = inMinimum.get();
    let max = inMaximum.get();

    if (newArr.length != arr.length)newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++)
    {
        newArr[i] = smoothstep(min, max, arr[i]);
    }
    outArray.set(null);
    outArray.set(newArr);
};

function smoothstep(min, max, value)
{
    let x = Math.max(0.0, Math.min(1.0, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
}
