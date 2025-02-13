let inArr = op.inArray("Array"),

    outNum = op.outNumber("Num Items"),

    outMinX = op.outNumber("Min X"),
    outMinY = op.outNumber("Min Y"),
    outMinZ = op.outNumber("Min Z"),

    outMaxX = op.outNumber("Max X"),
    outMaxY = op.outNumber("Max Y"),
    outMaxZ = op.outNumber("Max Z"),

    outAvgX = op.outNumber("Average X"),
    outAvgY = op.outNumber("Average Y"),
    outAvgZ = op.outNumber("Average Z"),

    outCenterX = op.outNumber("Center X"),
    outCenterY = op.outNumber("Center Y"),
    outCenterZ = op.outNumber("Center Z");

function dist3d(x1, y1, z1, x2, y2, z2)
{
    const xd = x2 - x1;
    const yd = y2 - y1;
    const zd = z2 - z1;

    return Math.sqrt(xd * xd + yd * yd + zd * zd);
}

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
    outMinY.set(minY);
    outMinZ.set(minZ);

    outMaxX.set(maxX);
    outMaxY.set(maxY);
    outMaxZ.set(maxZ);

    outAvgX.set(avgX);
    outAvgY.set(avgY);
    outAvgZ.set(avgZ);

    outCenterX.set(CABLES.map(0.5, 0, 1, minX, maxX));
    outCenterY.set(CABLES.map(0.5, 0, 1, minY, maxY));
    outCenterZ.set(CABLES.map(0.5, 0, 1, minZ, maxZ));
};
