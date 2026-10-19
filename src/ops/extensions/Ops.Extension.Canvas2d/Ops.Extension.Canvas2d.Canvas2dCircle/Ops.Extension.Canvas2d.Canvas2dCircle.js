const
    inExec = op.inTrigger("Exec"),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    inRadius = op.inFloat("Radius", 100),
    inStartAngle = op.inFloat("Start Angle", 0),
    inEndAngle = op.inFloat("End Angle", 360),
    inAngleFlip = op.inBool("Counterclockwise", false),
    inAlignX = op.inSwitch("Align X", ["Left", "Center", "Right"], "Center"),
    inAlignY = op.inSwitch("Align Y", ["Top", "Middle", "Bottom"], "Middle"),

    inMeth = op.inSwitch("Method", ["Fill", "Stroke", "Clip"], "Fill"),

    next = op.outTrigger("Next");

inMeth.onChange = updateTitle;
updateTitle();

function updateTitle()
{
    op.setUiAttrib({ "extendTitle": inMeth.get() });
}

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        ctx.save();
        let x = inX.get();
        let y = inY.get();
        if (inAlignX.get() == "Left") x += inRadius.get();
        else if (inAlignX.get() == "Right") x -= inRadius.get();
        if (inAlignY.get() == "Top") y += inRadius.get();
        else if (inAlignY.get() == "Bottom") y -= inRadius.get();

        ctx.beginPath();
        ctx.arc(x, y, inRadius.get(), inStartAngle.get() * CGL.DEG2RAD, inEndAngle.get() * CGL.DEG2RAD, inAngleFlip.get());

        if (inMeth.get() == "Fill") ctx.fill();
        else if (inMeth.get() == "Stroke") ctx.stroke();
        else if (inMeth.get() == "Clip") ctx.clip();

        next.trigger();
        ctx.restore();
    }
};
