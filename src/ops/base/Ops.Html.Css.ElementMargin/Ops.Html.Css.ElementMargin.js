const
    inEle = op.inObject("Element", null, "element"),
    inPadding = op.inFloat("Margin", 0),
    inPadTop = op.inFloat("Margin Top", 0),
    inPadBottom = op.inFloat("Margin Bottom", 0),
    inPadLeft = op.inFloat("Margin Left", 0),
    inPadRight = op.inFloat("Margin Right", 0),
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
    ele.style.removeProperty("margin-top");
    ele.style.removeProperty("margin-bottom");
    ele.style.removeProperty("margin-left");
    ele.style.removeProperty("margin-right");
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        ele.style["margin-top"] = inPadding.get() + inPadTop.get() + "px";
        ele.style["margin-bottom"] = inPadding.get() + inPadBottom.get() + "px";
        ele.style["margin-left"] = inPadding.get() + inPadLeft.get() + "px";
        ele.style["margin-right"] = inPadding.get() + inPadRight.get() + "px";
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}
