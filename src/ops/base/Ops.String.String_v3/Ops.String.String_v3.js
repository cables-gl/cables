const
    v = op.inString("value", ""),
    result = op.outString("String");
v.setUiAttribs({ "display": "text" });

let hasExtTitle = false;
let lines = [];

op.setUiAttrib({ "height": 100, "width": 250, "resizable": true, "vizLayerMaxZoom": 2500 });

v.onChange = function ()
{
    op.setUiAttrib({ "extendTitle": "" });
    if (CABLES.UI)
    {
        if (v.get()) lines = (v.get() || "").split("\n");
        else lines = [];
    }
    result.set(v.get());
};

op.renderVizLayer = (ctx, layer, viz) =>
{
    if (layer.height < 10)
    {
        op.setUiAttrib({ "extendTitle": v.get() });
        hasExtTitle = true;
        return;
    }

    if (hasExtTitle) op.setUiAttrib({ "extendTitle": null });
    hasExtTitle = false;

    viz.clear(ctx, layer);

    if (!v.get()) return;

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    viz.renderText(ctx, layer, lines, {
        "zoomText": false,
        "showLineNum": false,
        "fontSize": 12,
        "scroll": 0,
        "syntax": "text",
        "showWhitespace": false,
        "wrap": true
    });

    ctx.restore();
};
