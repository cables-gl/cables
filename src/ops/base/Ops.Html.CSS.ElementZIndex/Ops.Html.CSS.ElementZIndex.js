const
    inEle = op.inObject("Element", null, "element"),
    inZ = op.inInt("Z-Index", 0),
    inActive = op.inBool("Active", true),
    outEle = op.outObject("HTML Element", null, "element");

let ele = null;

inEle.onChange =
    inEle.onLinkChanged =
    inActive.onChange =
    inZ.onChange = update;

op.onDelete = remove;

function remove()
{
    if (!ele) return;
    ele.style.removeProperty("z-index");
    outEle.setRef(ele);
}

function update()
{
    if (!inActive.get())
    {
        remove();
        return;
    }
    ele = inEle.get();
    if (ele && ele.style)
    {
        ele.style["z-index"] = Math.floor(inZ.get());
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(ele);
}
