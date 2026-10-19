const
    inExec = op.inTrigger("Exec"),
    inPoints = op.inArray("Points", null, 2),
    inMode = op.inSwitch("Mode", ["Strip", "Segments"], "Strip"),
    inClosed = op.inBool("Closed", false),
    next = op.outTrigger("Next");

inMode.onChange = updateUi;
updateUi();

function updateUi()
{
    inClosed.setUiAttribs({ "greyout": inMode.get() != "Strip" });
    op.setUiAttrib({ "extendTitle": inMode.get() });
}

inExec.onTriggered = () =>
{
    const points = inPoints.get();

    if (op.patch.tempData.canvasCompose && points && points.length >= 4)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        const numPoints = Math.floor(points.length / 2);

        ctx.beginPath();

        if (inMode.get() == "Strip")
        {
            ctx.moveTo(points[0], points[1]);
            for (let i = 1; i < numPoints; i++) ctx.lineTo(points[i * 2], points[i * 2 + 1]);
            if (inClosed.get()) ctx.closePath();
        }
        else
        {
            for (let i = 0; i + 1 < numPoints; i += 2)
            {
                ctx.moveTo(points[i * 2], points[i * 2 + 1]);
                ctx.lineTo(points[i * 2 + 2], points[i * 2 + 3]);
            }
        }

        ctx.stroke();
    }

    next.trigger();
};
