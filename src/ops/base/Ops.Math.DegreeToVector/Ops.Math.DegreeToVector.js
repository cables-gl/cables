const
    deg = op.inValueFloat("degree", 0),
    x = op.outNumber("x"),
    y = op.outNumber("y");

deg.onChange = update;

function update()
{
    let rad = deg.get() * CGL.DEG2RAD;
    x.set(-1 * Math.sin(rad));
    y.set(Math.cos(rad));
}
