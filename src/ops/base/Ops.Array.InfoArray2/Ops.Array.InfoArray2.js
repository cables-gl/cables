let inArr = op.inArray("Array", 2),

    outNum = op.outNumber("Num Items"),

    outMinX = op.outNumber("Min X"),
    outMaxX = op.outNumber("Max X"),
    outAvgX = op.outNumber("Average X"),

    outMinY = op.outNumber("Min Y"),
    outMaxY = op.outNumber("Max Y"),
    outAvgY = op.outNumber("Average Y");

inArr.onChange = function ()
{
    let arr = inArr.get();

    let minX = 999999999;
    let maxX = -999999999;
    let avgX = 0;

    let minY = 999999999;
    let maxY = -999999999;
    let avgY = 0;
    outNum.set(0);

    if (arr)
    {
        outNum.set(arr.length / 2);

        for (let i = 0; i < arr.length; i += 2)
        {
            avgX += arr[i];
            minX = Math.min(minX, arr[i]);
            maxX = Math.max(maxX, arr[i]);

            avgY += arr[i + 1];
            minY = Math.min(minY, arr[i + 1]);
            maxY = Math.max(maxY, arr[i + 1]);
        }

        avgX /= arr.length / 2;
        avgY /= arr.length / 2;
    }

    outMinX.set(minX);
    outMaxX.set(maxX);
    outAvgX.set(avgX);

    outMinY.set(minY);
    outMaxY.set(maxY);
    outAvgY.set(avgY);
};
