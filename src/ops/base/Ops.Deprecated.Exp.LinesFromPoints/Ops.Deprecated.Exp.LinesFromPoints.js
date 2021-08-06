const pointsPort = op.inArray("Points");
const linesPort = op.outArray("Lines");

pointsPort.onChange = update;

function update()
{
    const points = pointsPort.get();
    const lineArray = [];
    if (!points) { return; }
    for (let i = 0; i < points.length - 3; i += 3)
    {
        for (let j = i + 3; j < points.length; j += 3)
        {
            lineArray.push(
                points[i],
                points[i + 1],
                points[i + 2],
                points[j],
                points[j + 1],
                points[j + 2]
            );
        }
    }
    linesPort.set(lineArray);
}

function distance(points, ia, ib)
{
    const dx = points[ib] - points[ia];
    const dy = points[ib + 1] - points[ia + 1];
    const dz = points[ib + 2] - points[ia + 2];

    const dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

    return dist;
}
