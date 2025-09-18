const
    inEle = op.inObject("Element"),
    outTagname = op.outString("Tagname"),
    outId = op.outString("Id");

inEle.onChange = () =>
{
    const ele = inEle.get();
    if (!ele)
    {
        outTagname.set("");
        return;
    }
    outTagname.set(ele.tagName);
    outId.set(ele.id);
};
