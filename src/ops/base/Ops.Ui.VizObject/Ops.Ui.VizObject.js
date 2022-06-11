const inArr = op.inObject("Object");

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });

inArr.onLinkChanged = () =>
{
    console.log(1);
    if (inArr.isLinked())
    {
        const p = inArr.links[0].getOtherPort(inArr);
        console.log(p);

        op.setUiAttrib({ "extendTitle": p.uiAttribs.objType });
    }
};

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    let obj = inArr.get();
    const padding = 10;

    let str = "???";

    if (obj && obj.getInfo)
    {
        obj = obj.getInfo();
    }

    if (obj instanceof Element)
    {
        const o = {};

        o.id = obj.getAttribute("id");
        o.classes = obj.classList.value;
        o.innerText = obj.innerText;
        o.tagName = obj.tagName;

        obj = o;
    }

    try
    {
        str = JSON.stringify(obj, false, 4);
    }
    catch (e)
    {
        str = "object can not be displayed as string";
    }

    if (str === undefined)str = "undefined";
    if (str === null)str = "null";
    str = String(str);
    let lines = str.split("\n");

    for (let j = 0; j < lines.length; j++)
        ctx.fillText(lines[j], layer.x / layer.scale + padding, layer.y / layer.scale + ((j + 1) * 12));

    ctx.restore();
};
