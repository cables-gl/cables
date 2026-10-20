const
    inExec = op.inTrigger("Exec"),
    r = op.inFloatSlider("r", Math.random()),
    g = op.inFloatSlider("g", Math.random()),
    b = op.inFloatSlider("b", Math.random()),
    a = op.inFloatSlider("a", 1),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });
op.setPortGroup("Color", [r, g, b, a]);

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        ctx.save();

        ctx.fillStyle = "rgba(" + r.get() * 255 + "," + g.get() * 255 + "," + b.get() * 255 + "," + a.get() + ")";

        next.trigger();
        ctx.restore();
    }
};
