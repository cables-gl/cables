const inGeom = op.inObject("Geometry"),
    outBB = op.outObject("Boundings"),
    outMinX = op.outNumber("Min X"),
    outMinY = op.outNumber("Min Y"),
    outMinZ = op.outNumber("Min Z"),
    outMaxX = op.outNumber("Max X"),
    outMaxY = op.outNumber("Max Y"),
    outMaxZ = op.outNumber("Max Z"),
    outPoints = op.outArray("MaxMin Points");

const points = [];

inGeom.onChange = () =>
{
    const bb = new CGL.BoundingBox(inGeom.get());
    outBB.set(bb);

    outMinX.set(bb._min[0]);
    outMinY.set(bb._min[1]);
    outMinZ.set(bb._min[2]);

    outMaxX.set(bb._max[0]);
    outMaxY.set(bb._max[1]);
    outMaxZ.set(bb._max[2]);

    points.length = 0;
    points.push(
        // bb._max[0],bb._max[1],bb._max[2],
        // bb._min[0],bb._min[1],bb._min[2],

        bb._max[0], bb._max[1], bb._max[2],
        bb._max[0], bb._min[1], bb._max[2],
        bb._min[0], bb._min[1], bb._max[2],
        bb._min[0], bb._max[1], bb._max[2],

        bb._max[0], bb._max[1], bb._min[2],
        bb._max[0], bb._min[1], bb._min[2],
        bb._min[0], bb._min[1], bb._min[2],
        bb._min[0], bb._max[1], bb._min[2],

        bb._center[0], bb._center[1], bb._center[2]
    );

    outPoints.setRef(points);
};
