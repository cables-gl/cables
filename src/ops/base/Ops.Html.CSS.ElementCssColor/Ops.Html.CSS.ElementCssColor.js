const
    inEle = op.inObject("Element", null, "element"),
    inSetCol = op.inBool("Set Color", true),
    r = op.inValueSlider("Color R", 0),
    g = op.inValueSlider("Color G", 0),
    b = op.inValueSlider("Color B", 0),
    a = op.inValueSlider("Color A", 1),
    inSetBg = op.inBool("Set Background", true),
    bgr = op.inValueSlider("Background Color R", 1),
    bgg = op.inValueSlider("Background Color G", 1),
    bgb = op.inValueSlider("Background Color B", 1),
    bga = op.inValueSlider("Background Color A", 1),
    outEle = op.outObject("HTML Element", null, "element");

r.setUiAttribs({ "colorPick": true });
bgr.setUiAttribs({ "colorPick": true });

let ele = null;

inEle.onChange =
    inSetCol.onChange =
    inSetBg.onChange =
    inEle.onLinkChanged =
    r.onChange = g.onChange = b.onChange = a.onChange =
    bgr.onChange = bgg.onChange = bgb.onChange = bga.onChange = update;

op.onDelete = remove;

function remove()
{
    if (ele)
    {
        ele.style.removeProperty("color");
        ele.style.removeProperty("background-color");
    }
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        let rgbaText = "inherit";

        if (inSetCol.get()) rgbaText = "rgba(" + Math.floor(r.get() * 255) + "," + Math.floor(g.get() * 255) + "," + Math.floor(b.get() * 255) + "," + a.get() + ")";
        ele.style.color = rgbaText;

        let rgbaBg = "inherit";
        if (inSetBg.get()) rgbaBg = "rgba(" + Math.floor(bgr.get() * 255) + "," + Math.floor(bgg.get() * 255) + "," + Math.floor(bgb.get() * 255) + ", " + bga.get() + ")";
        ele.style["background-color"] = rgbaBg;
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}
