const
    inExec = op.inTrigger("Render"),
    r = op.inFloatSlider("r", 0),
    g = op.inFloatSlider("g", 0),
    b = op.inFloatSlider("b", 0),
    a = op.inFloatSlider("a", 0.5),
    inBlur = op.inFloat("Blur", 4),
    inOffsetX = op.inFloat("Offset X", 2),
    inOffsetY = op.inFloat("Offset Y", 2),
    outNext = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        ctx.save();
        ctx.shadowColor = "rgba(" + r.get() * 255 + "," + g.get() * 255 + "," + b.get() * 255 + "," + a.get() + ")";
        ctx.shadowBlur = inBlur.get();
        ctx.shadowOffsetX = inOffsetX.get();
        ctx.shadowOffsetY = inOffsetY.get();
        outNext.trigger();
        ctx.restore();
    }
};
