const
    inEle = op.inObject("Element"),
    inAttrName = op.inString("Attribute Name", ""),
    result = op.outString("Value"),
    outHasAttr = op.outBoolNum("Has Attribute");

inAttrName.onChange =
inEle.onChange = () =>
{
    if (inAttrName.get() == "") return result.set("");

    op.setUiAttrib({ "extendTitle": inAttrName.get() + "" });

    if (inEle.get())
    {
        const hasAttr = inEle.get().hasAttribute(inAttrName.get());

        if (hasAttr)
        {
            const v = inEle.get().getAttribute(inAttrName.get());
            result.set(v);
        }
        else
            result.set("");
        outHasAttr.set(hasAttr);
    }
    else
    {
        result.set("");
    }
};
