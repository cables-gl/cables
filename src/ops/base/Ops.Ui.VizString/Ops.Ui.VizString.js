const
    inStr = op.inStringEditor("String"),
    inZoomText = op.inBool("ZoomText", false),
    inLineNums = op.inBool("Line Numbers", true),
    inWhitespace = op.inBool("Whitespace", false),
    inWrap = op.inBool("Wrap lines", false),
    syntax = op.inValueSelect("Syntax", ["text", "glsl", "css", "html", "xml", "json", "javascript", "inline-css", "sql"], "text"),
    inFontSize = op.inFloat("Font Size", 10),
    inPos = op.inFloatSlider("Scroll", 0),
    outStr = op.outString("Passthrough String");

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true, "vizLayerMaxZoom": 2500 });
inStr.ignoreValueSerialize = true;

let lines = [];

inStr.onLinkChanged = () =>
{
    if (!inStr.isLinked())
    {
        lines = [];
        inStr.set(null);

        op.setUiAttrib({ "extendTitle": "" });
    }
    else
    {
        const pp = inStr.links[0].getOtherPort(inStr);
        if (pp) op.setUiAttrib({ "extendTitle": pp.name });
    }
};

inStr.onChange = () =>
{
    outStr.set(inStr.get());
    if (CABLES.UI)
    {
        if (inStr.get()) lines = inStr.get().split("\n");
        else lines = [];
    }
};

op.renderVizLayer = (ctx, layer, viz) =>
{
    viz.clear(ctx, layer);

    if (!inStr.get()) return;

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    viz.renderText(ctx, layer, lines, {
        "zoomText": inZoomText.get(),
        "showLineNum": inLineNums.get(),
        "fontSize": inFontSize.get(),
        "scroll": inPos.get(),
        "syntax": syntax.get(),
        "showWhitespace": inWhitespace.get(),
        "wrap": inWrap.get()
    });

    ctx.restore();
};
