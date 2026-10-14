const
    calc = op.inTriggerButton("Calc"),
    x1 = op.inFloat("x1"),
    y1 = op.inFloat("y1"),
    z1 = op.inFloat("z1"),
    x2 = op.inFloat("x2"),
    y2 = op.inFloat("y2"),
    z2 = op.inFloat("z2"),
    next = op.outTrigger("Next"),
    dist = op.addOutPort(new CABLES.Port(op, "distance"));

op.setPortGroup("Point 1", [x1, y1, z1]);
op.setPortGroup("Point 2", [x2, y2, z2]);

calc.onTriggered = function ()
{
    const xd = x2.get() - x1.get();
    const yd = y2.get() - y1.get();
    const zd = z2.get() - z1.get();

    dist.set(Math.sqrt(xd * xd + yd * yd + zd * zd));

    next.trigger();
};
