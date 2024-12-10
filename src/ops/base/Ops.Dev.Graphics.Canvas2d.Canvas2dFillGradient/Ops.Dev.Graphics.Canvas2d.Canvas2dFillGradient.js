const
    inExec = op.inTrigger("Exec"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    inX = op.inFloat("X 1", 0),
    inY = op.inFloat("Y 1", 0),
    inX2 = op.inFloat("X 2", 100),
    inY2 = op.inFloat("Y 2", 0),

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

        const grd = ctx.createLinearGradient(inX.get(), inY.get(), inX2.get(), inY2.get());
        grd.addColorStop(0, "red");
        grd.addColorStop(0.5, "blue");
        grd.addColorStop(0.7, "white");

        // const str=(((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1));

        ctx.fillStyle = grd;

        next.trigger();
        ctx.restore();
    }
};
