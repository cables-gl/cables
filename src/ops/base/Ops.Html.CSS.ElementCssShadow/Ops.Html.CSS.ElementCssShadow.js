const
    inEle = op.inObject("Element"),
    inType = op.inSwitch("Type", ["drop filter", "box", "text"], "drop filter"),
    inProp1 = op.inFloat("X", 5),
    inProp2 = op.inFloat("Y", 3),
    inProp3 = op.inFloat("Blur", 10),
    r = op.inValueSlider("Color r", 0),
    g = op.inValueSlider("Color g", 0),
    b = op.inValueSlider("Color b", 0),
    a = op.inValueSlider("Color a", 1),
    outEle = op.outObject("HTML Element");

r.setUiAttribs({ "colorPick": true });

let ele = null;

inEle.onChange = inEle.onLinkChanged =
inType.onChange =
    r.onChange =
    g.onChange =
    b.onChange =
    a.onChange =
    inProp1.onChange =
    inProp2.onChange =
    inProp3.onChange = update;

function update()
{
    if (ele)
    {
        ele.style.removeProperty("filter");
        ele.style.removeProperty("text-shadow");
        ele.style.removeProperty("box-shadow");
    }
    ele = inEle.get();

    if (ele && ele.style)
    {
        const rgba = "rgba(" + Math.floor(r.get() * 255) + "," + Math.floor(g.get() * 255) + "," + Math.floor(b.get() * 255) + "," + a.get() + ")";

        const str = inProp1.get() + "px " + inProp2.get() + "px " + inProp3.get() + "px " + rgba;

        if (inType.get() == "drop filter") ele.style.filter = "drop-shadow(" + str + ")";
        else ele.style[inType.get() + "-shadow"] = str;
    }
    else
    {
        setTimeout(update, 50);
    }

    if (outEle != inEle.get())
        outEle.setRef(inEle.get());
}
