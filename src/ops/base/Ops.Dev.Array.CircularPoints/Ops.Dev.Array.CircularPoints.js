const
    outArr = op.outArray("Points", 3),
    percent = op.inFloat("Rounds", 1),
    inRoundOffset = op.inFloat("Radius Add Round", 0.1),
    inPointRadOffset = op.inFloat("Radius Add Point", 0.1),
    inPointOffset = op.inFloat("Point Offset XY", 0.1),
    inPointOffsetZ = op.inFloat("Point Offset Z", 0.1),
    radius = op.inValue("Radius", 1),
    segments = op.inValue("Round Segments", 40),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array lengths");

inPointRadOffset.onChange =
inPointOffset.onChange =
radius.onChange =
inPointOffsetZ.onChange =
    inRoundOffset.onChange =
    percent.onChange =
    segments.onChange = calcArray;

function calcArray()
{
    const segs = Math.max(3, Math.floor(segments.get()));
    const points = [];

    const roundOffset = inRoundOffset.get();

    let count = 0;
    const r = radius.get();
    const pointOff = inPointRadOffset.get() / 100;
    const roundOff = inRoundOffset.get();
    const offZ = inPointOffsetZ.get();
    let progressOffset = 0.0;

    for (let i = 0; i < segs * percent.get(); i++)
    {
        progressOffset = i * inPointOffset.get();
        const radiusOff = Math.floor(i / segs) * roundOff;

        let degInRad = (360 / segs) * (i + progressOffset) * CGL.DEG2RAD;
        let posx = Math.cos(degInRad) * (r + radiusOff + pointOff * i);
        let posy = Math.sin(degInRad) * (r + radiusOff + pointOff * i);

        points.push(posx);
        points.push(posy);
        points.push(i * offZ);
    }

    outArr.set(null);
    outArr.set(points);
    outTotalPoints.set(points.length / 3);
    outArrayLength.set(points.length);
}

calcArray();
