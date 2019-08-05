const
    outArr=op.outArray("Points"),
    percent=op.inValueSlider('percent',1),
    segments=op.inValue('segments',40),
    radius=op.inValue('radius',1),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array lengths");

radius.onChange=
    percent.onChange=
    segments.onChange=calcArray;

function calcArray()
{
    const segs=Math.max(3,Math.floor(segments.get()));
    const points=[];

    let count=0;
    for (let i=0; i < segs*percent.get(); i++)
    {
        var degInRad = (360/segs)*i*CGL.DEG2RAD;
        var posx=Math.cos(degInRad)*radius.get();
        var posy=Math.sin(degInRad)*radius.get();

        points.push(posx);
        points.push(posy);
        points.push(0);
    }

    outArr.set(null);
    outArr.set(points);
    outTotalPoints.set(points.length/3);
    outArrayLength.set(points.length);
}

calcArray();
