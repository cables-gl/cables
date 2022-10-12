const
    inArr = op.inArray("Array"),
    outMin = op.outNumber("Min"),
    outMax = op.outNumber("Max"),
    outAvg = op.outNumber("Average");

inArr.onChange = function ()
{
    let arr = inArr.get();

    let min = 999999999;
    let max = -999999999;
    let avg = 0;

    if (arr)
    {
        for (let i = 0; i < arr.length; i++)
        {
            avg += arr[i];
            min = Math.min(min, arr[i]);
            max = Math.max(max, arr[i]);
        }
        avg /= arr.length;
    }
    outMin.set(min);
    outMax.set(max);
    outAvg.set(avg);
};
