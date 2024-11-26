const
    inEle = op.inObject("Element", null, "element"),
    inPadding = op.inFloat("Padding", 10),
    inPadTop = op.inFloat("Padding Top", 0),
    inPadBottom = op.inFloat("Padding Bottom", 0),
    inPadLeft = op.inFloat("Padding Left", 0),
    inPadRight = op.inFloat("Padding Right", 0),
    outEle = op.outObject("HTML Element", null, "element");

let ele = null;

inEle.onChange =
    inEle.onLinkChanged =
    inPadTop.onChange =
    inPadBottom.onChange =
    inPadRight.onChange =
    inPadLeft.onChange =
        update;

op.onDelete = remove;

function remove()
{
    if (!ele) return;
    ele.style.removeProperty("padding-top");
    ele.style.removeProperty("padding-bottom");
    ele.style.removeProperty("padding-left");
    ele.style.removeProperty("padding-right");
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        ele.style["padding-top"] = inPadding.get() + inPadTop.get() + "px";
        ele.style["padding-bottom"] = inPadding.get() + inPadBottom.get() + "px";
        ele.style["padding-left"] = inPadding.get() + inPadLeft.get() + "px";
        ele.style["padding-right"] = inPadding.get() + inPadRight.get() + "px";
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}
