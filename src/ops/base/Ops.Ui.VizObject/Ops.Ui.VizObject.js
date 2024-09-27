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

function myStringify(o)
{
    let str = "{\n";

    for (let i in o)
    {
        str += "    \"" + i + "\": ";

        if (o[i] === null)
        {
            str += "null";
        }
        else
        if (o[i] === undefined)
        {
            str += "undefined";
        }
        else
        if (o[i] === true)
        {
            str += "true";
        }
        else
        if (o[i] === false)
        {
            str += "false";
        }
        else
        if (typeof o[i] === "number")
        {
            str += String(o[i]);
        }
        else if (typeof o[i] === "string")
        {
            str += "\"" + o[i] + "\"";
        }
        else if (Array.isArray(o[i]) || (o[i].constructor && o[i].constructor.name === "Float32Array"))
        {
            str += "{" + o[i].constructor.name + "[" + o[i].length + "]} ";
            str += "[";
            for (let a = 0; a < Math.min(5, o[i].length); a++)
            {
                if (a > 0)str += ",";
                str += o[i][a];
            }
            str += "...";
            str += "]";
        }
        else
        {
            str += "{" + o[i].constructor.name + "}";
        }

        str += ",\n";
    }

    str += "}";

    return str;
}

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
            str = myStringify(obj);
            // str = JSON.stringify(obj, false, 4);
            // if (
            //     obj.hasOwnProperty("isTrusted") && Object.keys(obj).length == 1 ||
            // (str == "{}" && obj && obj.constructor && obj.constructor.name != "Object"))
            // {
            //     str = "could not stringify object: " + obj.constructor.name + "\n";

            //     const o = {};
            //     for (const i in obj)
            //     {
            //         if (!obj[i]) continue;

            //         if (obj[i].constructor)
            //         {
            //             if (obj[i].constructor.name == "Number" || obj[i].constructor.name == "String" || obj[i].constructor.name == "Boolean")
            //                 o[i] = obj[i];
            //         }
            //         else
            //             o[i] = "{???}";
            //     }
            //     obj = o;
            //     str = JSON.stringify(obj, false, 4);
            // }
        }
        catch (e)
        {
            str = "object can not be displayed as string\n" + e.message;
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
