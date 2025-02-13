const
    inEle = op.inObject("Element"),
    inThick = op.inFloat("Thickness", 3),
    inRadius = op.inFloat("Radius", 0),

    r = op.inValueSlider("Color R", 1),
    g = op.inValueSlider("Color G", 1),
    b = op.inValueSlider("Color B", 1),
    a = op.inValueSlider("Color A", 1),
    borderTop = op.inBool("Top", true),
    borderBottom = op.inBool("Bottom", true),
    borderLeft = op.inBool("Left", true),
    borderRight = op.inBool("Right", true),

    outEle = op.outObject("HTML Element", null, "element");

r.setUiAttribs({ "colorPick": true });

let ele = null;

borderTop.onChange =
borderBottom.onChange =
borderLeft.onChange =
borderRight.onChange =
inEle.onChange =
    inEle.onLinkChanged =
inThick.onChange =
inRadius.onChange =
    r.onChange = g.onChange = b.onChange = a.onChange =
         update;

op.onDelete = remove;

function remove()
{
    if (ele)
    {
        ele.style.removeProperty("border");
        ele.style.removeProperty("borderTop");
        ele.style.removeProperty("borderBottom");
        ele.style.removeProperty("borderLeft");
        ele.style.removeProperty("borderRight");
        ele.style.removeProperty("border-radius");
    }
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        let rgbaText = "rgba(" + Math.floor(r.get() * 255) + "," + Math.floor(g.get() * 255) + "," + Math.floor(b.get() * 255) + "," + Math.floor(a.get()) + ")";

        if (borderTop.get() && borderBottom.get() && borderRight.get() && borderLeft.get())
        {
            ele.style.border = inThick.get() + "px solid " + rgbaText;
        }
        else
        {
            if (borderTop.get())ele.style.borderTop = inThick.get() + "px solid " + rgbaText;
            if (borderBottom.get())ele.style.borderBottom = inThick.get() + "px solid " + rgbaText;
            if (borderLeft.get())ele.style.borderLeft = inThick.get() + "px solid " + rgbaText;
            if (borderRight.get())ele.style.borderRight = inThick.get() + "px solid " + rgbaText;
        }

        ele.style["border-radius"] = inRadius.get() + "px";
    }
    else
    {
        setTimeout(update, 50);
    }

    // if (outEle != inEle.get())
    outEle.setRef(inEle.get());
}
