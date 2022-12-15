const
    radius = op.inValue("Radius", 1),
    segments = op.inValue("Round Segments", 40),
    percent = op.inFloat("Rounds", 1),
    inRoundOffset = op.inFloat("Radius Add Round", 0.1),
    inPointRadOffset = op.inFloat("Radius Add Point", 0.1),
    inOffset = op.inFloat("Offset", 0),
    inPointOffset = op.inFloat("Point Offset XY", 0.1),
    inPointOffsetZ = op.inFloat("Point Offset Z", 0.1),
    inOffsetRot = op.inFloat("Offset Rotation"),
    outArr = op.outArray("Points", 3),
    outRotArr = op.outArray("Rotation", 3),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array lengths");

inOffset.onChange =
    inOffsetRot.onChange =
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
    const rots = [];

    const roundOffset = inRoundOffset.get();

    let count = 0;
    const offsetRot = inOffsetRot.get();
    const r = radius.get();
    const pointOff = inPointRadOffset.get() / 100;
    const roundOff = inRoundOffset.get();
    const offZ = inPointOffsetZ.get();
    let progressOffset = 0.0;

    for (let i = 0; i < segs * percent.get(); i++)
    {
        progressOffset = i * inPointOffset.get() + inOffset.get();
        const radiusOff = Math.floor(i / segs) * roundOff;

        let degInRad = (360 / segs) * (i + progressOffset) * CGL.DEG2RAD;
        let posx = Math.cos(degInRad) * (r + radiusOff + pointOff * i);
        let posy = Math.sin(degInRad) * (r + radiusOff + pointOff * i);

        rots.push(0, 0, degInRad * CGL.RAD2DEG - offsetRot);

        points.push(posx, posy, i * offZ);
    }

    outArr.set(null);
    outArr.set(points);

    outRotArr.set(null);
    outRotArr.set(rots);

    outTotalPoints.set(points.length / 3);
    outArrayLength.set(points.length);
}

calcArray();
