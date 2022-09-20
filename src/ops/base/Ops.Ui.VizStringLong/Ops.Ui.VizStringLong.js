const
    inStr = op.inString("String");

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
    let offset = 0;

    const lines = inStr.get().split("\n");

    for (let i = offset; i < offset + lines.length; i += 1)
    {
        if (i > lines.length) continue;

        ctx.fillStyle = "#888";

        ctx.fillText(i,
            layer.x / layer.scale + padding,
            layer.y / layer.scale + 10 + (i - offset) * 10 + padding);

        ctx.fillStyle = "#ccc";

        ctx.fillText(lines[i],
            layer.x / layer.scale + padding + 30,
            layer.y / layer.scale + 10 + (i - offset) * 10 + padding);
    }

    ctx.restore();
};
