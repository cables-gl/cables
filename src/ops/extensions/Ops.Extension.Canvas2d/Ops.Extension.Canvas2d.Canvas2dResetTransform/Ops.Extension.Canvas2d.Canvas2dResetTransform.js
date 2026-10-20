const
    inExec = op.inTrigger("Render"),
    outNext = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        ctx.save();
        const t = op.patch.tempData.canvasCompose.transform;
        if (t) ctx.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]);
        else ctx.resetTransform();
        outNext.trigger();
        ctx.restore();
    }
};
