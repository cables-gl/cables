const
    inExec = op.inTrigger("Exec"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1),
    inWidth = op.inFloat("LineWidth", 3),
    inCap = op.inSwitch("Cap", ["butt", "round", "square"], "butt"),
    inJoin = op.inSwitch("Join", ["miter", "round", "bevel"], "miter"),
    inMiterLimit = op.inFloat("Miter Limit", 10),
    inDashed = op.inBool("Dashed", false),
    inDashLength = op.inFloat("Dash Length", 20),
    inGapLength = op.inFloat("Gap Length", 10),
    inDashOffset = op.inFloat("Dash Offset", 0),

    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });
op.setPortGroup("Color", [r, g, b, a]);
op.setPortGroup("Line", [inWidth, inCap, inJoin, inMiterLimit]);
// dash and gap lengths are what is visible: round and square caps extend each dash by half the line width at both ends, the drawn pattern compensates for that
op.setPortGroup("Dash", [inDashed, inDashLength, inGapLength, inDashOffset]);

inJoin.onChange =
    inDashed.onChange = updateUi;
updateUi();

function updateUi()
{
    inMiterLimit.setUiAttribs({ "greyout": inJoin.get() != "miter" });
    inDashLength.setUiAttribs({ "greyout": !inDashed.get() });
    inGapLength.setUiAttribs({ "greyout": !inDashed.get() });
    inDashOffset.setUiAttribs({ "greyout": !inDashed.get() });
}

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        ctx.save();

        ctx.strokeStyle = "rgba(" + r.get() * 255 + "," + g.get() * 255 + "," + b.get() * 255 + "," + a.get() + ")";
        ctx.lineWidth = inWidth.get();
        ctx.lineCap = inCap.get();
        ctx.lineJoin = inJoin.get();
        ctx.miterLimit = inMiterLimit.get();
        if (inDashed.get())
        {
            const capLength = inCap.get() == "butt" ? 0 : inWidth.get();
            ctx.setLineDash([Math.max(0, inDashLength.get() - capLength), inGapLength.get() + capLength]);
        }
        else ctx.setLineDash([]);
        ctx.lineDashOffset = inDashOffset.get();

        next.trigger();
        ctx.restore();
    }
};
