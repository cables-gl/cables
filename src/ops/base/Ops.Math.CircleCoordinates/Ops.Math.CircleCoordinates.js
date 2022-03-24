const
    inPos = op.inFloat("Position"),
    inRadius = op.inFloat("Radius", 1),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y");

inPos.onChange =
    inRadius.onChange = calc;

function calc()
{
    const r = inRadius.get();
    const degInRad = (360 * inPos.get()) * CGL.DEG2RAD;

    outX.set(Math.sin(degInRad) * r);
    outY.set(Math.cos(degInRad) * r);
}
