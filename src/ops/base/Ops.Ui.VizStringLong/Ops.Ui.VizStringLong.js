const
    inStr = op.inString("String"),
    inPos = op.inFloatSlider("Scroll", 0);

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    if (!inStr.get()) return;

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    let padding = 4;

    const lineHeight = 10;

    const lines = inStr.get().split("\n");
    const numLines = Math.floor(layer.height / layer.scale / lineHeight);

    let offset = Math.floor(inPos.get() * lines.length);

    offset = Math.max(offset, 0);
    offset = Math.min(offset, lines.length - numLines);

    const offsetLeft = ((offset + numLines + " ").length - 1) * 9.5;

    let indent = "";
    for (let i = 0; i < (offset + numLines + " ").length; i++) indent += " ";

    for (let i = offset; i < offset + numLines; i += 1)
    {
        if (i >= lines.length || i < 0) continue;

        ctx.fillStyle = "#888";

        ctx.fillText(i,
            layer.x / layer.scale + padding,
            layer.y / layer.scale + lineHeight + (i - offset) * lineHeight + padding);

        ctx.fillStyle = "#ccc";

        ctx.fillText(indent + lines[i],
            layer.x / layer.scale + padding,
            layer.y / layer.scale + lineHeight + (i - offset) * lineHeight + padding);
    }

    ctx.restore();
};
