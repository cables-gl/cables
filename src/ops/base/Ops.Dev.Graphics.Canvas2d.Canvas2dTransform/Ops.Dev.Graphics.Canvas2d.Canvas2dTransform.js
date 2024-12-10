const
    inExec = op.inTrigger("Render"),
    inX = op.inFloat("X", 0),
    inY = op.inFloat("Y", 0),
    inRot = op.inFloat("Rotate", 0),
    inScale = op.inFloat("Scale", 1),
    outNext = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        ctx.save();

        ctx.translate(inX.get(), inY.get());
        if (inRot.get() != 0)ctx.rotate(inRot.get() * CGL.DEG2RAD);
        if (inScale.get() != 1)ctx.scale(inScale.get(), inScale.get());
        outNext.trigger();

        ctx.restore();
    }
};
