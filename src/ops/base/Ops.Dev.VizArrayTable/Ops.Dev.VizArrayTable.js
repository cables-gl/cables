const inArr = op.inArray("Array");

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    const arr = inArr.get() || [];
    let stride = 1;

    if (!arr)
    {
        op.setUiAttrib({ "extendTitle": "" });
        return;
    }

    op.setUiAttrib({ "extendTitle": "length: " + arr.length });

    if (inArr.links.length > 0 && inArr.links[0].getOtherPort(inArr))
        stride = inArr.links[0].getOtherPort(inArr).uiAttribs.stride || 1;

    let lines = Math.floor(layer.height / layer.scale / 10 - 1);
    let padding = 4;

    for (let i = 0; i < lines * stride; i += stride)
    {
        ctx.fillStyle = "#666";

        ctx.fillText(i / stride,
            layer.x / layer.scale + padding,
            layer.y / layer.scale + 10 + i / stride * 10 + padding);

        ctx.fillStyle = "#ccc";

        if (i + stride > arr.length) continue;

        for (let s = 0; s < stride; s++)
        {
            let str = "?";
            const v = arr[i + s];

            if (CABLES.UTILS.isNumeric(v)) str = String(Math.round(v * 10000) / 10000);
            else if (typeof v == "string") str = v;
            else if (Array.isArray(v))
            {
                let preview = "...";
                if (v.length == 0) preview = "";
                str = "[" + preview + "] (" + v.length + ")";
            }
            else if (typeof v == "object") str = "{}";

            ctx.fillText(str, layer.x / layer.scale + s * 100 + 50, layer.y / layer.scale + 10 + i / stride * 10 + padding);
        }
    }

    ctx.restore();
};
