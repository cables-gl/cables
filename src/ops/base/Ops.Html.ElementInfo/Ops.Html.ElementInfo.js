const
    inEle = op.inObject("Element"),
    outTagname = op.outString("Tagname"),
    outId = op.outString("Id"),
    outAttrs = op.outObject("Attributes");

inEle.onChange = () =>
{
    const ele = inEle.get();
    if (!ele)
    {
        outTagname.set("");
        return;
    }

    const attrs = {};
    for (const a of ele.attributes) attrs[a.name] = a.value;
    outAttrs.setRef(attrs);
    outTagname.set(ele.tagName);
    outId.set(ele.id);
};
