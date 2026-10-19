const
    inExec = op.inTrigger("Exec"),
    inText = op.inString("Text", "cables"),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    font = op.inString("font", "Arial"),
    weight = op.inString("weight", "normal"),
    align = op.inSwitch("align", ["left", "center", "right"], "center"),

    inFontSize = op.inFloat("fontSize", 100),

    next = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        ctx.save();
        ctx.beginPath();
        let fontSize = parseFloat(inFontSize.get());
        let fontname = font.get() || "arial";
        if (fontname.indexOf(" ") > -1) fontname = "\"" + fontname + "\"";
        ctx.font = weight.get() + " " + fontSize + "px " + fontname + "";
        ctx.textAlign = align.get();
        ctx.fillText(inText.get(), inX.get(), inY.get());

        next.trigger();
        ctx.restore();
    }
};
