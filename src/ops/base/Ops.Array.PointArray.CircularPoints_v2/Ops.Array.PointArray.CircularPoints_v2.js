const
    radius = op.inValue("Radius", 1),
    segments = op.inValue("Round Segments", 40),
    percent = op.inFloat("Rounds", 1),
    inRoundOffset = op.inFloat("Radius Add Round", 0),
    inPointRadOffset = op.inFloat("Radius Add Point", 0),
    inOffset = op.inFloat("Offset", 0),
    inPointOffset = op.inFloat("Point Offset XY", 0),
    inPointOffsetZ = op.inFloat("Point Offset Z", 0),
    inOffsetRot = op.inFloat("Offset rotation"),
    planeSelection = op.inSwitch("Plane", ["XY", "XZ", "YZ"], "XY"),
    inClose = op.inBool("Loop", false),
    rotationDirection = op.inSwitch("Rotation Direction", ["Clockwise", "Anticlockwise"], "Anticlockwise"),
    outArr = op.outArray("Points", 3),
    outRotArr = op.outArray("Rotation", 3),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array lengths");

inOffset.onChange =
    inClose.onChange =
    inOffsetRot.onChange =
    inPointRadOffset.onChange =
    inPointOffset.onChange =
    radius.onChange =
    inPointOffsetZ.onChange =
    inRoundOffset.onChange =
    percent.onChange =
    segments.onChange =
    planeSelection.onChange =
    rotationDirection.onChange = calcArray;

function calcArray()
{
    const segs = Math.max(3, Math.floor(segments.get()));
    const points = [];
    const rots = [];

    let progressOffset = 0.0;
    const offsetRotRad = inOffsetRot.get() * (Math.PI / 180); // Convert offset rotation to radians
    const r = radius.get();
    const offZ = inPointOffsetZ.get();

    let degInRadMul = 1;
    if (rotationDirection.get() === "Clockwise") degInRadMul *= -1; // Reverse direction for clockwise rotation

    for (let i = 0; i < segs * percent.get(); i++)
    {
        progressOffset = i * inPointOffset.get() + inOffset.get();
        const radiusOff = Math.floor(i / segs) * inRoundOffset.get();

        let degInRad = (360 / segs) * (i + progressOffset) * (Math.PI / 180); // Convert degrees to radians

        degInRad *= degInRadMul;

        const posR = r + radiusOff + inPointRadOffset.get() * i; // Effective radius with offsets
        const posx = Math.cos(degInRad) * posR;
        const posy = Math.sin(degInRad) * posR;
        const posz = i * offZ; // Z-coordinate progresses with each segment

        switch (planeSelection.get())
        {
        case "XY":
            points.push(posx, posy, posz);
            break;
        case "XZ":
            points.push(posx, posz, posy);
            break;
        case "YZ":
            points.push(posz, posx, posy);
            break;
        }

        rots.push(0, 0, (degInRad - offsetRotRad) * (180 / Math.PI)); // Rotation in degrees, adjusted for offset
    }

    if (inClose.get())
    {
        points.push(points[0], points[1], points[2]);
        rots.push(rots[0], rots[1], rots[2]);
    }

    outArr.setRef(points);
    outRotArr.setRef(rots);
    outTotalPoints.set(points.length / 3);
    outArrayLength.set(points.length);
}

calcArray();
