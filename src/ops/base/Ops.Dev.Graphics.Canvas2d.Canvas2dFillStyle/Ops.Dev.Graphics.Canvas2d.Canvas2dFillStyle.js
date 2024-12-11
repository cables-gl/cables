const
    inExec = op.inTrigger("Exec"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        ctx.save();

        const red = parseInt(r.get() * 255);
        const green = parseInt(g.get() * 255);
        const blue = parseInt(b.get() * 255);

        const str = (((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1));

        ctx.fillStyle = "#" + str;

        next.trigger();
        ctx.restore();
    }
};
