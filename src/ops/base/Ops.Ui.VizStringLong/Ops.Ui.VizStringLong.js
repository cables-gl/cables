const
    inStr = op.inStringEditor("String"),
    inPos = op.inFloatSlider("Scroll", 0);

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });
inStr.ignoreValueSerialize = true;

let lines = [];

inStr.onLinkChanged = () =>
{
    if (!inStr.isLinked())
    {
        lines = [];
        inStr.set(null);
    }
};

inStr.onChange = () =>
{
    if (inStr.get()) lines = inStr.get().split("\n");
    else lines = [];
};

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

    const numLines = Math.floor(layer.height / layer.scale / lineHeight);

    let offset = Math.floor(inPos.get() * lines.length);

    offset = Math.max(offset, 0);
    offset = Math.min(offset, lines.length - numLines);
    if (lines.length < numLines)offset = 0;

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

    const gradHeight = 30;

    if (offset > 0)
    {
        const radGrad = ctx.createLinearGradient(0, layer.y / layer.scale + 5, 0, layer.y / layer.scale + gradHeight);
        radGrad.addColorStop(0, "#222");
        radGrad.addColorStop(1, "rgba(34,34,34,0.0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(layer.x / layer.scale, layer.y / layer.scale, 200000, gradHeight);
    }

    if (offset + numLines < lines.length)
    {
        const radGrad = ctx.createLinearGradient(0, layer.y / layer.scale + layer.height / layer.scale - gradHeight + 5, 0, layer.y / layer.scale + layer.height / layer.scale - gradHeight + gradHeight);
        radGrad.addColorStop(1, "#222");
        radGrad.addColorStop(0, "rgba(34,34,34,0.0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(layer.x / layer.scale, layer.y / layer.scale + layer.height / layer.scale - gradHeight, 200000, gradHeight);
    }

    ctx.restore();
};
