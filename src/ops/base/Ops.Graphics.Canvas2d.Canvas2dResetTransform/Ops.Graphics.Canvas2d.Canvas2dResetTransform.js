const
    inExec = op.inTrigger("Render"),
    outNext = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.frameStore.canvasCompose)
    {
        const ctx = op.patch.frameStore.canvasCompose.ctx;
        ctx.save();
        ctx.resetTransform();
        outNext.trigger();
        ctx.restore();
    }
};
