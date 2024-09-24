const
    inObj = op.inObject("Object"),
    inConsole = op.inTriggerButton("console log"),
    inZoomText = op.inBool("ZoomText", false),
    inLineNums = op.inBool("Line Numbers", true),
    inFontSize = op.inFloat("Font Size", 10),
    inPos = op.inFloatSlider("Scroll", 0);

let lines = [];
inConsole.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true, "vizLayerMaxZoom": 2500 });

inObj.onChange = () =>
{
    let obj = inObj.get();
    let str = "???";
    // console.log(obj)
    if (obj && obj.getInfo) obj = obj.getInfo();

    if (obj && obj.constructor && obj.constructor.name != "Object") op.setUiAttribs({ "extendTitle": obj.constructor.name });

    if (obj === undefined)str = "undefined";
    else if (obj == null)str = "null";
    else
        try
        {
            str = JSON.stringify(obj, false, 4);

            if (
                obj.hasOwnProperty("isTrusted") && Object.keys(obj).length == 1 ||
            (str == "{}" && obj && obj.constructor && obj.constructor.name != "Object"))
            {
                str = "could not stringify object: " + obj.constructor.name + "\n";

                const o = {};
                for (const i in obj)
                {
                    if (!obj[i]) continue;

                    if (obj[i].constructor)
                    {
                        if (obj[i].constructor.name == "Number" || obj[i].constructor.name == "String" || obj[i].constructor.name == "Boolean")
                            o[i] = obj[i];
                    }
                    else
                        o[i] = "{???}";
                }
                obj = o;
                str = JSON.stringify(obj, false, 4);
            }
        }
        catch (e)
        {
            str = "object can not be displayed as string", e.msg;
        }

    str = String(str);
    lines = str.split("\n");
};

inObj.onLinkChanged = () =>
{
    if (inObj.isLinked())
    {
        const p = inObj.links[0].getOtherPort(inObj);

        op.setUiAttrib({ "extendTitle": p.uiAttribs.objType });
    }
};

inConsole.onTriggered = () =>
{
    console.info(inObj.get());
};

op.renderVizLayer = (ctx, layer, viz) =>
{
    viz.clear(ctx, layer);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    viz.renderText(ctx, layer, lines, {
        "zoomText": inZoomText.get(),
        "showLineNum": inLineNums.get(),
        "syntax": "js",
        "fontSize": inFontSize.get(),
        "scroll": inPos.get()
    });

    ctx.restore();
};

//
