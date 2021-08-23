const
    exe = op.inTrigger("exe"),
    numx = op.inValueInt("num x", 5),
    numy = op.inValueInt("num y", 5),
    mul = op.inValueFloat("mul", 1),
    center = op.inBool("center"),
    trigger = op.outTrigger("trigger"),
    outX = op.outValue("x"),
    outY = op.outValue("y"),
    idx = op.outValue("index"),
    total = op.outValue("total iterations");

exe.onTriggered = function ()
{
    let subX = 0;
    let subY = 0;
    const m = mul.get();
    const nx = numx.get();
    const ny = numy.get();

    if (center.get())
    {
        subX = ((nx - 1) * m) / 2.0;
        subY = ((ny - 1) * m) / 2.0;
    }

    for (let y = 0; y < ny; y++)
    {
        outY.set((y * m) - subY);
        for (let x = 0; x < nx; x++)
        {
            outX.set((x * m) - subX);
            idx.set(x + y * nx);
            trigger.trigger();
        }
    }
    total.set(numx.get() * numy.get());
};
