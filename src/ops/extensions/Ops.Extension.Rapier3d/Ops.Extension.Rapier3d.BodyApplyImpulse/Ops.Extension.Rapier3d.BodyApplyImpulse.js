const
    exec = op.inTrigger("Trigger"),
    inBodies = op.inArray("Bodies"),
    inType = op.inSwitch("Type", ["Impulse", "Torque Impulse"], "Impulse"),
    myVecX = op.inFloat("Vector X", 1),
    myVecY = op.inFloat("Vector Y"),
    myVecZ = op.inFloat("Vector Z"),

    impulse = op.inTriggerButton("Apply"),

    next = op.outTrigger("Next"),
    result = op.outNumber("Result");

let apply = false;

impulse.onTriggered = () =>
{
    apply = true;
};

exec.onTriggered = () =>
{
    const bodies = inBodies.get();

    if (!bodies || !bodies.length) return;

    if (apply)
    {
        const t = inType.get() == "Impulse";
        for (let i = 0; i < bodies.length; i++)
        {
            if (t)bodies[i].applyImpulse({ "x": myVecX.get(), "y": myVecY.get(), "z": myVecZ.get() }, true);
            else bodies[i].applyTorqueImpulse({ "x": myVecX.get(), "y": myVecY.get(), "z": myVecZ.get() }, true);
        }
        apply = false;
    }
};
