const
    exec = op.inTrigger("Trigger"),
    inBodies = op.inArray("Bodies"),
    inType = op.inSwitch("Type", ["Impulse", "Torque Impulse"], "Impulse"),
    myVecX = op.inFloat("Vector X"),
    myVecY = op.inFloat("Vector Y"),
    myVecZ = op.inFloat("Vector Z"),

    inApply = op.inBool("Apply", true),

    next = op.outTrigger("Next"),
    result = op.outNumber("Result");

exec.onTriggered = () =>
{
    const bodies = inBodies.get();

    if (!bodies || !bodies.length) return;
    if (inApply.get())
    {
        const t = inType.get() == "Impulse";
        for (let i = 0; i < bodies.length; i++)
        {
            if (t)bodies[i].addForce({ "x": myVecX.get(), "y": myVecY.get(), "z": myVecZ.get() }, true);
            else bodies[i].applyTorqueForce({ "x": myVecX.get(), "y": myVecY.get(), "z": myVecZ.get() }, true);
        }
    }
};
