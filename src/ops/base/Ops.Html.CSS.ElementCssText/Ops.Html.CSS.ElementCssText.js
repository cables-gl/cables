const
    inEle = op.inObject("Element", null, "element"),
    inFamily = op.inString("Font Family", "sans serif"),
    inSize = op.inFloat("Text Size", 12),
    inWeight = op.inString("Font Weight", "normal"),

    inAlign = op.inSwitch("Text Align", ["Left", "Center", "Right", "Justify"], "Left"),

    inOverflow = op.inBool("Overflow Ellipsis", false),

    inLetterSpace = op.inFloat("Letter Spacing", 0),

    inLineHeight = op.inFloat("Line Height", 0),

    inUserSelectNone = op.inBool("Disable Text Select", false),

    // in1 = op.inSwitch("White Space",["Initial","no-wrap"], "Initial"),
    outEle = op.outObject("HTML Element", null, "element");

let ele = null;

inLetterSpace.onChange =
    inOverflow.onChange =
    inEle.onChange =
    inEle.onLinkChanged =
    inFamily.onChange =
    inSize.onChange =
    inWeight.onChange =
    inAlign.onChange =
    inLineHeight.onChange =
        update;

op.onDelete = remove;

function remove()
{
    if (!ele) return;
    ele.style.removeProperty("font-family");
    ele.style.removeProperty("user-select");
    ele.style.removeProperty("letter-spacing");
    ele.style.removeProperty("text-align");
    ele.style.removeProperty("line-height");
    ele.style.removeProperty("font-size");
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        ele.style["font-family"] = inFamily.get();
        ele.style["letter-spacing"] = inLetterSpace.get() + "px";

        ele.style["font-weight"] = inWeight.get();
        ele.style["text-align"] = inAlign.get().toLowerCase();

        if (inSize.get())ele.style["font-size"] = inSize.get() + "px";
        else ele.style["font-size"] = "";

        if (inLineHeight.get()) ele.style["line-height"] = inLineHeight.get() + "px";
        else ele.style["line-height"] = "";

        if (inUserSelectNone.get())ele.style["user-select"] = "none";
    }
    else
    {
        setTimeout(update, 50);
    }

    if (outEle != inEle.get())
        outEle.setRef(inEle.get());
}
