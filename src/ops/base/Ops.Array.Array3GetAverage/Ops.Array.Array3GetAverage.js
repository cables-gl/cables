const
    inArr = op.inArray("Array", 3),
    avgX = op.outNumber("Average X"),
    avgY = op.outNumber("Average Y"),
    avgZ = op.outNumber("Average Z");

inArr.onChange = function ()
{
    let arr = inArr.get();
    if (!arr)
    {
        avgX.set(0);
        avgY.set(0);
        avgZ.set(0);
        return;
    }
    let x = 0;
    let y = 0;
    let z = 0;

    for (let i = 0; i < arr.length; i += 3)
    {
        x += arr[i + 0];
        y += arr[i + 1];
        z += arr[i + 2];
    }

    x /= arr.length / 3;
    y /= arr.length / 3;
    z /= arr.length / 3;

    avgX.set(x);
    avgY.set(y);
    avgZ.set(z);
};
