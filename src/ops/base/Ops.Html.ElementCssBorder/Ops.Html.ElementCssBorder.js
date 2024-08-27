const
    inEle = op.inObject("Element"),
    inThick = op.inFloat("Thickness", 3),
    inRadius = op.inFloat("Radius", 0),

    r = op.inValueSlider("Color R", 0),
    g = op.inValueSlider("Color G", 0),
    b = op.inValueSlider("Color B", 0),
    a = op.inValueSlider("Color A", 1),
    outEle = op.outObject("HTML Element");

r.setUiAttribs({ "colorPick": true });

let ele = null;

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
        ele.style.border = inThick.get() + "px solid " + rgbaText;

        ele.style["border-radius"] = inRadius.get() + "px";
    }
    else
    {
        setTimeout(update, 50);
    }

    if (outEle != inEle.get())
        outEle.setRef(inEle.get());
}
