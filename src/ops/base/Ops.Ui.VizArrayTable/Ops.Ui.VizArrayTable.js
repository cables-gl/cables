const
    inArr = op.inArray("Array"),
    inStride = op.inInt("Stride", 0),
    inOffset = op.inInt("Start Row", 0);

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true, "vizLayerMaxZoom": 2500 });

function getCellValue(v)
{
    let str = "";

    if (typeof v == "string")
    {
        // if (CABLES.isNumeric(v)) str = "\"" + v + "\"";
        // else str = v;
        str = "\"" + v + "\"";
    }
    else if (CABLES.isNumeric(v)) str = String(Math.round(v * 10000) / 10000);
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
        str += String(v);
    }
    else
    {
        str += String(v);
    }

    return str;
}

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    const arr = inArr.get() || [];
    let stride = inStride.get() || 1;

    if (inArr.get() === null) op.setUiAttrib({ "extendTitle": "null" });
    else if (inArr.get() === undefined) op.setUiAttrib({ "extendTitle": "undefined" });
    else op.setUiAttrib({ "extendTitle": "length: " + arr.length });

    if (inArr.links.length > 0 && inArr.links[0].getOtherPort(inArr))
        stride = inArr.links[0].getOtherPort(inArr).uiAttribs.stride || inStride.get() || 1;

    if (arr.length % stride != 0)op.setUiError("stride", "stride does not fit length of array. some values may not be shown", 1);
    else op.setUiError("stride", null);

    let lines = Math.floor(layer.height / layer.scale / 10 - 1);
    let padding = 4;
    let offset = inOffset.get() * stride;
    let columnsWidth = [];

    for (let i = 0; i < stride; i++)columnsWidth[i] = 0;

    for (let i = offset; i < offset + lines * stride; i += stride)
    {
        for (let s = 0; s < stride; s++)
        {
            const v = arr[i + s];

            columnsWidth[s] = Math.max(columnsWidth[s], getCellValue(v).length);
        }
    }

    let columsPos = [];
    let addUpPos = 30;
    for (let i = 0; i < stride; i++)
    {
        columsPos[i] = addUpPos;
        addUpPos += (columnsWidth[i] + 1) * 7;
    }

    for (let i = offset; i < offset + lines * stride; i += stride)
    {
        if (i < 0) continue;
        if (i + stride > arr.length) continue;

        ctx.fillStyle = "#666";

        const lineNum = (i) / stride;

        if (lineNum >= 0)
            ctx.fillText(lineNum,
                layer.x / layer.scale + padding,
                layer.y / layer.scale + 10 + (i - offset) / stride * 10 + padding);

        for (let s = 0; s < stride; s++)
        {
            const v = arr[i + s];
            let str = getCellValue(v);

            ctx.fillStyle = "#ccc";

            if (typeof v == "string")
            {
                str = v;
            }
            else if (CABLES.isNumeric(v)) str = String(Math.round(v * 10000) / 10000);
            else if (Array.isArray(v))
            {
                str = JSON.stringify(v);
            }
            else if (typeof v == "object")
            {
                try
                {
                    str = JSON.stringify(v);
                }
                catch (e)
                {
                    str = "{Object}";
                }
            }
            else if (v != v || v === undefined)
            {
                ctx.fillStyle = "#f00";
                str = "?";
            }

            ctx.fillText(str,
                layer.x / layer.scale + columsPos[s],
                layer.y / layer.scale + 10 + (i - offset) / stride * 10 + padding);
        }
    }

    if (inArr.get() === null) ctx.fillText("null", layer.x / layer.scale + 10, layer.y / layer.scale + 10 + padding);
    else if (inArr.get() === undefined) ctx.fillText("undefined", layer.x / layer.scale + 10, layer.y / layer.scale + 10 + padding);

    const gradHeight = 30;

    if (layer.scale <= 0) return;
    if (offset > 0)
    {
        const radGrad = ctx.createLinearGradient(0, layer.y / layer.scale + 5, 0, layer.y / layer.scale + gradHeight);
        radGrad.addColorStop(0, "#222");
        radGrad.addColorStop(1, "rgba(34,34,34,0.0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(layer.x / layer.scale, layer.y / layer.scale, 200000, gradHeight);
    }

    if (offset + lines * stride < arr.length)
    {
        const radGrad = ctx.createLinearGradient(0, layer.y / layer.scale + layer.height / layer.scale - gradHeight + 5, 0, layer.y / layer.scale + layer.height / layer.scale - gradHeight + gradHeight);
        radGrad.addColorStop(1, "#222");
        radGrad.addColorStop(0, "rgba(34,34,34,0.0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(layer.x / layer.scale, layer.y / layer.scale + layer.height / layer.scale - gradHeight, 200000, gradHeight);
    }

    ctx.restore();
};
