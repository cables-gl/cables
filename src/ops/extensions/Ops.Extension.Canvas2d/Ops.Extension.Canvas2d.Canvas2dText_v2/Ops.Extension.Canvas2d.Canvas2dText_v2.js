const
    inExec = op.inTrigger("Exec"),
    inText = op.inString("Text", "cables"),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    font = op.inString("font", "Arial"),
    weight = op.inString("weight", "normal"),
    align = op.inSwitch("align", ["left", "center", "right"], "left"),
    baseline = op.inSwitch("Baseline", ["top", "middle", "alphabetic", "bottom"], "top"),

    inFontSize = op.inFloat("fontSize", 100),
    inWidthMode = op.inSwitch("Width Mode", ["None", "Wrap", "Fit"], "None"),
    inWidth = op.inFloat("Width", 500),
    inLineHeight = op.inFloat("Line Height", 1.2),
    inFill = op.inBool("Fill", true),
    inStroke = op.inBool("Stroke", false),

    next = op.outTrigger("Next"),
    outWidth = op.outNumber("Text Width"),
    outHeight = op.outNumber("Text Height"),
    outFontSize = op.outNumber("Drawn Font Size");

inText.setUiAttribs({ "display": "text" });

inWidthMode.onChange = updateUi;
updateUi();

function updateUi()
{
    inWidth.setUiAttribs({ "greyout": inWidthMode.get() == "None" });
}

function setFont(ctx, fontSize)
{
    let fontname = font.get() || "arial";
    if (fontname.indexOf(" ") > -1) fontname = "\"" + fontname + "\"";
    ctx.font = weight.get() + " " + fontSize + "px " + fontname;
}

// splits a paragraph at spaces into lines that are at most maxWidth wide, a single word longer than that gets its own line
function wrapParagraph(ctx, paragraph, maxWidth)
{
    const words = paragraph.split(" ");
    const lines = [];
    let line = words[0];
    for (let i = 1; i < words.length; i++)
    {
        const longer = line + " " + words[i];
        if (ctx.measureText(longer).width <= maxWidth) line = longer;
        else
        {
            lines.push(line);
            line = words[i];
        }
    }
    lines.push(line);
    return lines;
}

function getLines(ctx)
{
    const paragraphs = String(inText.get()).split("\n");
    if (inWidthMode.get() != "Wrap" || inWidth.get() <= 0) return paragraphs;

    let lines = [];
    for (let i = 0; i < paragraphs.length; i++) lines = lines.concat(wrapParagraph(ctx, paragraphs[i], inWidth.get()));
    return lines;
}

function getWidestLine(ctx, lines)
{
    let widest = 0;
    for (let i = 0; i < lines.length; i++) widest = Math.max(widest, ctx.measureText(lines[i]).width);
    return widest;
}

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.textAlign = align.get();
        ctx.textBaseline = baseline.get();

        let fontSize = parseFloat(inFontSize.get());
        setFont(ctx, fontSize);
        const lines = getLines(ctx);

        // fit: shrink the font until the widest line fits, never enlarge it
        if (inWidthMode.get() == "Fit" && inWidth.get() > 0)
        {
            const widest = getWidestLine(ctx, lines);
            if (widest > inWidth.get())
            {
                fontSize *= inWidth.get() / widest;
                setFont(ctx, fontSize);
            }
        }

        // the block of lines is placed like a single line would be: top starts at y, middle is centered, bottom/alphabetic ends at y
        const lineStep = fontSize * inLineHeight.get();
        let y = inY.get();
        if (baseline.get() == "middle") y -= (lines.length - 1) * lineStep / 2;
        else if (baseline.get() != "top") y -= (lines.length - 1) * lineStep;

        let width = 0;
        for (let i = 0; i < lines.length; i++)
        {
            const lineY = y + i * lineStep;
            if (inFill.get()) ctx.fillText(lines[i], inX.get(), lineY);
            if (inStroke.get()) ctx.strokeText(lines[i], inX.get(), lineY);

            const metrics = ctx.measureText(lines[i]);
            width = Math.max(width, metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight);
        }

        // bounding box of the drawn glyphs: from the top of the first line to the bottom of the last one
        const first = ctx.measureText(lines[0]);
        const last = ctx.measureText(lines[lines.length - 1]);
        outWidth.set(width);
        outHeight.set(first.actualBoundingBoxAscent + (lines.length - 1) * lineStep + last.actualBoundingBoxDescent);
        outFontSize.set(fontSize);

        next.trigger();
        ctx.restore();
    }
};
