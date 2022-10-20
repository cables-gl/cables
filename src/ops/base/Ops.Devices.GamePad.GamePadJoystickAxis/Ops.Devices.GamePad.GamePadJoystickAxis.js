const
    inAxis = op.inArray("Axis"),
    inAxisNum = op.inValueInt("Index"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    inDeadZone = op.outNumber("DeadZone", 0.1),
    outAngle = op.outNumber("Angle");

inAxis.onChange = function ()
{
    let arr = inAxis.get();
    if (!arr) return;

    let idx = inAxisNum.get() * 2;

    let x = 0;
    let y = 0;

    if (arr[idx + 0] > 0)x = CABLES.map(arr[idx + 0], inDeadZone.get(), 1, 0, 1);
    else x = CABLES.map(arr[idx + 0], -1, -inDeadZone.get(), -1, 0);

    if (arr[idx + 1] > 0)y = CABLES.map(arr[idx + 1], inDeadZone.get(), 1, 0, 1);
    else y = CABLES.map(arr[idx + 1], -1, -inDeadZone.get(), -1, 0);

    outX.set(x);
    outY.set(y);

    if (x != 0 || y != 0)
    {
        let theta = Math.atan2(x, y);

        let angle = theta * 180 / Math.PI * -1;
        outAngle.set(360 - (angle + 180));
    }
};
