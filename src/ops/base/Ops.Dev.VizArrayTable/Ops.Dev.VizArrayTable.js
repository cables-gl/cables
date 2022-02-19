const inArr = op.inArray("Array");

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });

op.renderPreviewLayer = (ctx, pos, size) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        pos[0],
        pos[1],
        size[0],
        size[1]
    );

    const sc = 1000 / gui.patchView._patchRenderer.viewBox.zoom * 1.5;

    ctx.save();
    ctx.scale(sc, sc);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    const arr = inArr.get() || [];
    let stride = 1;

    if (!arr) return;

    if (inArr.links.length > 0 && inArr.links[0].getOtherPort(inArr))
        stride = inArr.links[0].getOtherPort(inArr).uiAttribs.stride || 1;

    let lines = Math.floor(size[1] / sc / 10 - 1);
    let padding = 4;

    for (let i = 0; i < lines * stride; i += stride)
    {
        ctx.fillStyle = "#666";

        ctx.fillText(i / stride,
            pos[0] / sc + padding,
            pos[1] / sc + 10 + i / stride * 10 + padding);

        ctx.fillStyle = "#ccc";

        if (i + stride > arr.length) continue;

        for (let s = 0; s < stride; s++)
        {
            let str = "?";
            const v = arr[i + s];

            if (CABLES.UTILS.isNumeric(v)) str = String(Math.round(v * 10000) / 10000);
            else if (typeof v == "string") str = v;
            else if (typeof v == "array") str = "[]";
            else if (typeof v == "object") str = "{}";

            ctx.fillText(str, pos[0] / sc + s * 100 + 50, pos[1] / sc + 10 + i / stride * 10 + padding);
        }
    }

    ctx.restore();
};
