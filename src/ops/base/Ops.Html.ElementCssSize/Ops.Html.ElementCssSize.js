const
    inEle = op.inObject("Element"),
    inMethod = op.inSwitch("Method", ["Absolute", "Aspect Ratio"], "Absolute"),
    inWidth = op.inFloat("Width", 100),
    inHeight = op.inFloat("Height", 100),
    inAspect = op.inFloat("Aspect", 16 / 9),
    inUnit = op.inSwitch("Unit", ["px", "%"], "px"),
    outEle = op.outObject("HTML Element", null, "element");

let ele = null;

inAspect.onChange =
    inUnit.onChange =
    inEle.onChange =
    inEle.onLinkChanged =
    inWidth.onChange =
    inHeight.onChange = update;

op.onDelete = remove;

inMethod.onChange = () =>
{
    inHeight.setUiAttribs({ "greyout": inMethod.get() != "Absolute" });
    inAspect.setUiAttribs({ "greyout": inMethod.get() == "Absolute" });
};

function remove()
{
    if (ele)
    {
        ele.style.removeProperty("width");
        ele.style.removeProperty("height");
        ele.style.removeProperty("aspect-ratio");
    }
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        ele.style.width = inWidth.get() + inUnit.get();

        if (inMethod.get() == "Absolute") ele.style.height = inHeight.get() + inUnit.get();
        else ele.style["aspect-ratio"] = inAspect.get();
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}
