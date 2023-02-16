const
    inArr = op.inArray("Array"),
    outArr = op.outArray("Result", null, 3),
    outArrIdx = op.outArray("Result Index");

function dist(x1, y1, z1, x2, y2, z2)
{
    let xd = x2 - x1;
    let yd = y2 - y1;
    let zd = z2 - z1;
    return Math.abs(Math.sqrt(xd * xd + yd * yd + zd * zd));
}

inArr.onChange = function ()
{
    if (!inArr.get()) return;

    let arr = inArr.get();

    if (arr.length == 0) return;

    let data = [];
    let i = 0;
    for (i = 0; i < arr.length; i += 3)
    {
        data[i / 3] = {
            "x": arr[i + 0],
            "y": arr[i + 1],
            "z": arr[i + 2],
            "found": false,
            "pos": 0,
            "idx": i / 3
        };
    }

    let lastPoint = data[0];
    data[0].found = true;

    for (i = 0; i < data.length; i++)
    {
        let smallest = null;
        let smallDist = 999999999;

        for (let j = 0; j < data.length; j++)
        {
            let d = dist(
                lastPoint.x, lastPoint.y, lastPoint.z,
                data[j].x, data[j].y, data[j].z
            );

            if (d < smallDist && !data[j].found)
            {
                smallDist = d;
                smallest = data[j];
            }
        }

        if (smallest)
        {
            smallest.pos = i;
            smallest.found = true;
            lastPoint = smallest;
        }
    }

    data.sort(function (a, b)
    {
        return a.pos - b.pos;
    });

    let outArray = [];
    let indexArray = [];
    for (i = 0; i < data.length; i++)
    {
        outArray[i * 3 + 0] = data[i].x;
        outArray[i * 3 + 1] = data[i].y;
        outArray[i * 3 + 2] = data[i].z;

        indexArray[i] = data[i].idx;
    }
    outArr.set(outArray);

    outArrIdx.set(indexArray);
};
