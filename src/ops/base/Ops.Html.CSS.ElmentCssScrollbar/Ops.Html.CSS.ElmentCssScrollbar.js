const
    inEle = op.inObject("Element", null, "element"),
    inThin = op.inBool("Thin", false),

    inSetCol = op.inBool("Set Color", true),
    r = op.inValueSlider("Color R", 1),
    g = op.inValueSlider("Color G", 1),
    b = op.inValueSlider("Color B", 1),
    a = op.inValueSlider("Color A", 1),
    bgr = op.inValueSlider("Background R", 0),
    bgg = op.inValueSlider("Background G", 0),
    bgb = op.inValueSlider("Background B", 0),
    bga = op.inValueSlider("Background A", 1),

    outEle = op.outObject("HTML Element", null, "element");

let ele = null;
inEle.onChange =
    inSetCol.onChange =
    r.onChange = g.onChange = b.onChange = a.onChange =
    bgr.onChange = bgg.onChange = bgb.onChange = bga.onChange =
    inEle.onLinkChanged =
    inThin.onChange =
        update;

op.onDelete = remove;

function remove()
{
    if (!ele) return;
    ele.style.removeProperty("scrollbar-width");
    ele.style.removeProperty("scrollbar-color");
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        if (inThin.get())ele.style["scrollbar-width"] = "thin";

        if (inSetCol.get())
        {
            let v = "";
            v += "rgba(" + Math.floor(r.get() * 255) + "," + Math.floor(g.get() * 255) + "," + Math.floor(b.get() * 255) + "," + a.get() + ")";

            v += " rgba(" + Math.floor(bgr.get() * 255) + "," + Math.floor(bgg.get() * 255) + "," + Math.floor(bgb.get() * 255) + ", " + bga.get() + ")";

            ele.style["scrollbar-color"] = v;
        }
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}
