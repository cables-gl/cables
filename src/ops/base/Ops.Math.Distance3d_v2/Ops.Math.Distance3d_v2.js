const
    calc = op.inTriggerButton("Calc"),

    x1 = op.inValueFloat("x1"),
    y1 = op.inValueFloat("y1"),
    z1 = op.inValueFloat("z1"),

    x2 = op.inValueFloat("x2"),
    y2 = op.inValueFloat("y2"),
    z2 = op.inValueFloat("z2"),

    inMin = op.inValue("Min", 0);

op.setPortGroup("Point 1", [x1, y1, z1]);
op.setPortGroup("Point 2", [x2, y2, z2]);

const next = op.outTrigger("Next");
const dist = op.addOutPort(new CABLES.Port(op, "distance"));

let min = inMin.get();

inMin.onChange = function ()
{
    min = inMin.get();
};

calc.onTriggered = function ()
{
    const xd = x2.get() - x1.get();
    if (Math.abs(xd) > min) return;

    const yd = y2.get() - y1.get();
    if (Math.abs(yd) > min) return;

    const zd = z2.get() - z1.get();
    if (Math.abs(zd) > min) return;

    dist.set(Math.sqrt(xd * xd + yd * yd + zd * zd));

    next.trigger();
};
