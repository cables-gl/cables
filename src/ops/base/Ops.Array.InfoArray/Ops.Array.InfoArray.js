const
    inArr = op.inArray("Array"),
    outMin = op.outValue("Min"),
    outMax = op.outValue("Max"),
    outAvg = op.outValue("Average"),
    outUnique = op.outObject("Unique Items");

inArr.onChange = function ()
{
    var arr = inArr.get();

    var min = 999999999;
    var max = -999999999;
    var avg = 0;
    const counts = {};

    if (arr)
    {
        for (let i = 0; i < arr.length; i++)
        {
            const value = arr[i];
            avg += value;
            min = Math.min(min, value);
            max = Math.max(max, value);
            if (counts.hasOwnProperty(value))
            {
                counts[value]++;
            }
            else
            {
                counts[value] = 1;
            }
        }
        avg /= arr.length;
    }
    outMin.set(min);
    outMax.set(max);
    outAvg.set(avg);
    outUnique.set(counts);
};
