const
    p1x = op.inValue("Point 1 X"),
    p1y = op.inValue("Point 1 Y"),
    p2x = op.inValue("Point 2 X"),
    p2y = op.inValue("Point 2 Y"),
    outAngle = op.outNumber("Angle", 0);

p1x.onChange =
    p2x.onChange =
    p1y.onChange =
    p2y.onChange = update;

function update()
{
    let theta = Math.atan2(
        p1y.get() - p2y.get(),
        p1x.get() - p2x.get());

    let angle = theta * 180 / Math.PI * -1;

    outAngle.set(angle);
}
