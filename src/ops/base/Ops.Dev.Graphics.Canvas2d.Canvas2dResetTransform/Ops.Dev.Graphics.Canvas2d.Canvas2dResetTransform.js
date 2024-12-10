const
    inExec = op.inTrigger("Render"),
    outNext = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        ctx.save();
        ctx.resetTransform();
        outNext.trigger();
        ctx.restore();
    }
};
