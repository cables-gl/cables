const
    inArr = op.inArray("Array"),
    inOffset = op.inInt("Start Row", 0);

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
    let offset = inOffset.get() * stride;

    for (let i = offset; i < offset + lines * stride; i += stride)
    {
        if (i + stride > arr.length) continue;

        ctx.fillStyle = "#666";

        const lineNum = (i) / stride;

        if (lineNum >= 0)
            ctx.fillText(lineNum,
                layer.x / layer.scale + padding,
                layer.y / layer.scale + 10 + (i - offset) / stride * 10 + padding);

        for (let s = 0; s < stride; s++)
        {
            let str = "";
            const v = arr[i + s];

            ctx.fillStyle = "#ccc";

            if (typeof v == "string") str = "\"" + v + "\"";
            else if (CABLES.UTILS.isNumeric(v)) str = String(Math.round(v * 10000) / 10000);
            else if (Array.isArray(v))
            {
                let preview = "...";
                if (v.length == 0) preview = "";
                str = "[" + preview + "] (" + v.length + ")";
            }
            else if (typeof v == "object")
            {
                try
                {
                    str = JSON.stringify(v, true, 1);
                }
                catch (e)
                {
                    str = "{???}";
                }
            }
            else if (v != v || v === undefined)
            {
                ctx.fillStyle = "#f00";
                str += String(v);
            }
            else
            {
                str += String(v);
            }

            ctx.fillText(str,
                layer.x / layer.scale + s * 100 + 50,
                layer.y / layer.scale + 10 + (i - offset) / stride * 10 + padding);
        }
    }

    ctx.restore();
};
