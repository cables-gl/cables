const
    v = op.inString("value", ""),
    result = op.outString("String");
v.setUiAttribs({ "display": "text" });

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
    viz.clear(ctx, layer);

    if (!v.get()) return;

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    viz.renderText(ctx, layer, lines, {
        "zoomText": false,
        "showLineNum": false,
        "fontSize": 10,
        // "scroll": inPos.get(),
        // "syntax": syntax.get(),
        // "showWhitespace": inWhitespace.get(),
        "wrap": true
    });

    ctx.restore();
};
