const
    inExec = op.inTrigger("Exec"),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    inRadius = op.inFloat("Radius", 100),
    inStartAngle = op.inFloat("Start Angle", 0),
    inEndAngle = op.inFloat("End Angle", 360),
    inAngleFlip = op.inBool("Counterclockwise", false),

    inMeth = op.inSwitch("Method", ["Fill", "Stroke", "Clip"], "Fill"),

    next = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.arc(inX.get(), inY.get(), inRadius.get(), inStartAngle.get() * CGL.DEG2RAD, inEndAngle.get() * CGL.DEG2RAD, inAngleFlip.get());

        if (inMeth.get() == "Fill") ctx.fill();
        else if (inMeth.get() == "Stroke") ctx.stroke();
        else if (inMeth.get() == "Clip") ctx.clip();

        next.trigger();
        ctx.restore();
    }
};
