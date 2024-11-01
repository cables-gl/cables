const
    inEle = op.inObject("Element", null, "element"),
    inPadTop = op.inFloat("Padding Top", 3),
    inPadBottom = op.inFloat("Padding Bottom", 3),
    inPadLeft = op.inFloat("Padding Left", 3),
    inPadRight = op.inFloat("Padding Right", 3),
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
        ele.style["padding-top"] = inPadTop.get() + "px";
        ele.style["padding-bottom"] = inPadBottom.get() + "px";
        ele.style["padding-left"] = inPadLeft.get() + "px";
        ele.style["padding-right"] = inPadRight.get() + "px";
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}
