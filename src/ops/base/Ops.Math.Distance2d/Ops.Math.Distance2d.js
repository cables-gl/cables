const
    x1 = op.inFloat("x1"),
    y1 = op.inFloat("y1"),
    x2 = op.inFloat("x2"),
    y2 = op.inFloat("y2"),
    dist = op.outNumber("distance");

x1.onChange =
y1.onChange =
x2.onChange =
y2.onChange = calc;

function calc()
{
    const xd = x2.get() - x1.get();
    const yd = y2.get() - y1.get();
    dist.set(Math.sqrt(xd * xd + yd * yd));
}
