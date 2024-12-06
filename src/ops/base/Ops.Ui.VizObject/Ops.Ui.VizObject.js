const
    inObj = op.inObject("Object"),
    inConsole = op.inTriggerButton("console log"),
    inZoomText = op.inBool("ZoomText", false),
    inLineNums = op.inBool("Line Numbers", true),
    inExpString = op.inBool("Experimental Stringify", true),
    inFontSize = op.inFloat("Font Size", 10),
    inPos = op.inFloatSlider("Scroll", 0);

let lines = [];
inConsole.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true, "vizLayerMaxZoom": 2500 });

function myStringify(o, level = 0)
{
    let ind = "   ";
    let indent = "";
    let str = "";
    for (let i = 0; i < level; i++) indent += ind;

    let keys = Object.keys(o);
    let numKeys = keys.length;

    if (!(Array.isArray(o) || (o.constructor && o.constructor.name === "Float32Array")))
        keys = keys.sort();

    if (numKeys == 0)
    {
        str += indent + "{}";
    }
    else
    {
        let keyCounter = 0;
        str += indent + "{\n";
        for (let i = 0; i < keys.length; i++)
        {
            const item = o[keys[i]];

            keyCounter++;
            str += indent + ind;
            str += "\"" + keys[i] + "\": ";

            if (item === null)
            {
                str += "null";
            }
            else
            if (item === undefined)
            {
                str += "undefined";
            }
            else
            if (item === true)
            {
                str += "true";
            }
            else
            if (item === false)
            {
                str += "false";
            }
            else
            if (typeof item === "number")
            {
                str += String(item);
            }
            else if (typeof item === "string")
            {
                str += "\"" + item + "\"";
            }
            else if (Array.isArray(item) || (item.constructor && item.constructor.name === "Float32Array"))
            {
                str += "{" + item.constructor.name + "[" + item.length + "]} ";
                str += "[";
                for (let a = 0; a < Math.min(5, item.length); a++)
                {
                    if (a > 0)str += ",";
                    str += item[a];
                }
                str += "...";
                str += "]";
            }
            else if (item.constructor.name === "Object")
            {
                if (Object.keys(item).length == 0) str += "{}";
                else str += "\n" + myStringify(item, level + 1);
            }
            else
            {
                str += "[" + item.constructor.name + "]";
                str += "\n" + myStringify(item, level + 1);
            }

            if (keyCounter != numKeys)str += ",";
            str += "\n";
        }

        str += indent;
        str += "}";
    }

    return str;
}

inExpString.onChange =
inObj.onChange = () =>
{
    let obj = inObj.get();
    let str = "???";
    if (obj && obj.getInfo) obj = obj.getInfo();

    if (obj && obj.constructor && obj.constructor.name != "Object") op.setUiAttribs({ "extendTitle": obj.constructor.name });

    if (obj === undefined)str = "undefined";
    else if (obj == null)str = "null";
    else
        try
        {
            if (inExpString.get()) str = myStringify(obj);
            else str = JSON.stringify(obj, false, 4);

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
