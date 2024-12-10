const
    inExec = op.inTrigger("Render"),
    inMode = op.inDropDown("Blendmode", ["source-over", "source-in", "source-out", "source-atop", "destination-over", "destination-in", "destination-out", "destination-atop", "lighter", "copy", "xor", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], "source-over"),
    outNext = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        ctx.save();

        ctx.globalCompositeOperation = inMode.get();
        outNext.trigger();

        ctx.restore();
    }
};
