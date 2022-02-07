let inArr = op.inArray("Array"),

    outNum = op.outValue("Num Items"),

    outMinX = op.outNumber("Min X"),
    outMaxX = op.outNumber("Max X"),
    outAvgX = op.outNumber("Average X"),

    outMinY = op.outNumber("Min Y"),
    outMaxY = op.outNumber("Max Y"),
    outAvgY = op.outNumber("Average Y"),

    outMinZ = op.outNumber("Min Z"),
    outMaxZ = op.outNumber("Max Z"),
    outAvgZ = op.outNumber("Average Z");

inArr.onChange = function ()
{
    let arr = inArr.get();

    let minX = 999999999;
    let maxX = -999999999;
    let avgX = 0;

    let minZ = 999999999;
    let maxZ = -999999999;
    let avgZ = 0;

    let minY = 999999999;
    let maxY = -999999999;
    let avgY = 0;
    outNum.set(0);

    if (arr)
    {
        outNum.set(arr.length / 3);

        for (let i = 0; i < arr.length; i += 3)
        {
            avgX += arr[i];
            minX = Math.min(minX, arr[i]);
            maxX = Math.max(maxX, arr[i]);

            avgY += arr[i + 1];
            minY = Math.min(minY, arr[i + 1]);
            maxY = Math.max(maxY, arr[i + 1]);

            avgZ += arr[i + 2];
            minZ = Math.min(minZ, arr[i + 2]);
            maxZ = Math.max(maxZ, arr[i + 2]);
        }

        avgX /= arr.length / 3;
        avgY /= arr.length / 3;
        avgZ /= arr.length / 3;
    }

    outMinX.set(minX);
    outMaxX.set(maxX);
    outAvgX.set(avgX);

    outMinY.set(minY);
    outMaxY.set(maxY);
    outAvgY.set(avgY);

    outMinZ.set(minZ);
    outMaxZ.set(maxZ);
    outAvgZ.set(avgZ);
};
