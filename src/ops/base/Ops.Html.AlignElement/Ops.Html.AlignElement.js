const
    inEle = op.inObject("Element", null, "element"),
    inEleAlign = op.inObject("Align Element", null, "element"),
    inAlignHor = op.inSwitch("Horizontal Align", ["Left", "Center", "Right"], "Right"),
    inAlignVert = op.inSwitch("Vertical Align", ["Top", "Center", "Bottom"], "Top"),
    inOrientHor = op.inSwitch("Horizontal Orientation", ["Left", "Center", "Right"], "Center"),
    inOrientVert = op.inSwitch("Vertical Orientation", ["Top", "Center", "Bottom"], "Center"),
    inUpdate = op.inTriggerButton("Force update"),
    inOffsetX = op.inFloat("Offset X", 0),
    inOffsetY = op.inFloat("Offset Y", 0),
    outEle = op.outObject("Element passthrough"),
    outEleAligned = op.outObject("Aligned Element");

inEle.onLinkChanged =
    inEleAlign.onLinkChanged =
    op.onDelete = remove;

inUpdate.onTriggered =
inOrientHor.onChange =
    inOrientVert.onChange =
    inEleAlign.onChange =
    inAlignVert.onChange =
    inOffsetY.onChange =
    inOffsetX.onChange =
    inAlignHor.onChange = () =>
    {
        oldTop = null;
        update();
    };

let eleAlign = null;
let oldTop;
let oldLeft;
let oldWidth;
let oldHeight;

inEle.onChange = update;

update();

function remove()
{
    if (eleAlign)
    {
        eleAlign.style.removeProperty("top");
        eleAlign.style.removeProperty("left");
    }
}

function update()
{
    let ele = inEle.get();

    if (inEleAlign.get() != eleAlign)remove();
    eleAlign = inEleAlign.get();

    if (!ele || !eleAlign) return;

    if (!eleAlign.getBoundingClientRect)
    {
        op.error("ele has no boundinclientrect...");
        return;
    }

    const r = ele.getBoundingClientRect();
    const rCanv = op.patch.cgl.canvas.getBoundingClientRect();

    let childRect = null;

    if (inOrientVert.get() || inOrientHor.get()) childRect = eleAlign.getBoundingClientRect();

    if (r.top != oldTop ||
        r.left != oldLeft ||
        r.width != oldWidth ||
        r.height != oldHeight
    )
    {
        oldTop = r.top;
        oldLeft = r.left;
        oldWidth = r.width;
        oldHeight = r.height;

        let top = r.top - rCanv.top;
        let left = r.left - rCanv.left;
        if (inAlignVert.get() == "Bottom") top += r.height;
        if (inAlignVert.get() == "Center") top += r.height / 2;

        if (inAlignHor.get() == "Right") left += r.width;
        if (inAlignHor.get() == "Center") left += r.width / 2;

        if (inOrientHor.get() == "Right") left -= childRect.width;
        if (inOrientHor.get() == "Center") left -= childRect.width / 2;

        if (inOrientVert.get() == "Bottom") top -= childRect.height;
        if (inOrientVert.get() == "Center") top -= childRect.height / 2;

        eleAlign.style.top = (top + inOffsetY.get()) + "px";
        eleAlign.style.left = (left + inOffsetX.get()) + "px";

        outEle.setRef(ele);
        outEleAligned.setRef(eleAlign);
    }
}
