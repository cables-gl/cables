const
    inExec = op.inTrigger("Exec"),
    inWidth = op.inFloat("Width", 100),
    inHeight = op.inFloat("Height", 100),
    inRound = op.inFloat("Roundness", 0),
    inCenter = op.inBool("Center", false),
    inMeth = op.inSwitch("Method", ["Fill", "Stroke", "Clip"], "Fill"),
    next = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        ctx.imageSmoothingEnabled = false;

        let x = 0;
        let y = 0;
        if (inCenter.get())
        {
            x = -inWidth.get() / 2;
            y = -inHeight.get() / 2;
        }

        if (inRound.get() <= 0 && inMeth.get() == "Fill") ctx.fillRect(x, y, inWidth.get(), inHeight.get());
        else if (inRound.get() <= 0 && inMeth.get() == "Stroke") ctx.strokeRect(x, y, inWidth.get(), inHeight.get());
        else
        {
            ctx.beginPath();
            ctx.roundRect(x, y, inWidth.get(), inHeight.get(), inRound.get());
            ctx.closePath();

            if (inMeth.get() == "Fill") ctx.fill();
            else if (inMeth.get() == "Stroke") ctx.stroke();
            else if (inMeth.get() == "Clip") ctx.clip();
        }

        next.trigger();
    }
};
