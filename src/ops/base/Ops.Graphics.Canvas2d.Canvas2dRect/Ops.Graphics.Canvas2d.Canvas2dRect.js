const
    inExec = op.inTrigger("Exec"),
    inX = op.inFloat("X", 0),
    inY = op.inFloat("Y", 0),
    inWidth = op.inFloat("Width", 100),
    inHeight = op.inFloat("Height", 100),
    inRound = op.inFloat("Roundness", 0),
    inMeth = op.inSwitch("Method", ["Fill", "Stroke", "Clip"], "Fill"),
    next = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.frameStore.canvasCompose)
    {
        const ctx = op.patch.frameStore.canvasCompose.ctx;

        if (inRound.get() <= 0 && inMeth.get() == "Fill") ctx.fillRect(inX.get(), inY.get(), inWidth.get(), inHeight.get());
        else if (inRound.get() <= 0 && inMeth.get() == "Stroke") ctx.strokeRect(inX.get(), inY.get(), inWidth.get(), inHeight.get());
        else
        {
            ctx.beginPath();
            ctx.roundRect(inX.get(), inY.get(), inWidth.get(), inHeight.get(), inRound.get());
            ctx.closePath();

            if (inMeth.get() == "Fill") ctx.fill();
            else if (inMeth.get() == "Stroke") ctx.stroke();
            else if (inMeth.get() == "Clip") ctx.clip();
        }

        next.trigger();
    }
};
