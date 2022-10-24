const
    inX = op.inValue("X"),
    inY = op.inValue("Y"),
    outX = op.outNumber("Result X"),
    outY = op.outNumber("Result Y"),
    range = op.inValueBool("-1 to 1");

inX.onChange =
    inY.onChange =
    range.onChange = update;

function update()
{
    let x = inX.get() / op.patch.cgl.canvas.width;
    let y = inY.get() / op.patch.cgl.canvas.height;

    outX.set(x);
    outY.set(y);

    if (range.get())
    {
        x = x * 2 - 1;
        y = y * 2 - 1;
    }

    outX.set(x);
    outY.set(y);
}
