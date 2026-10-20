const
    inExec = op.inTrigger("Exec"),
    x = op.inInt("X", 0),
    y = op.inInt("Y", 0),
    next = op.outTrigger("Next"),
    outR = op.outNumber("R"),
    outG = op.outNumber("G"),
    outB = op.outNumber("B"),
    outA = op.outNumber("A");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        const t = op.patch.tempData.canvasCompose.transform || [1, 0, 0, 1, 0, 0];
        const d = ctx.getImageData(Math.floor(x.get() * t[0]), Math.floor(y.get() * t[3]), 1, 1);

        outR.set(d.data[0]);
        outG.set(d.data[1]);
        outB.set(d.data[2]);
        outA.set(d.data[3]);
    }
    next.trigger();
};
