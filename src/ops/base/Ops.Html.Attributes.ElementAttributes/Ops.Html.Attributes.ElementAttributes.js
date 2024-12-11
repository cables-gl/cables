const
    inEle = op.inObject("Element"),
    result = op.outObject("Attribs");

inEle.onChange = () =>
{
    if (!inEle.get())
    {
        result.setRef({});
        return;
    }

    const ele = inEle.get();
    const o = {};
    if (ele && ele.attributes)

        for (const attr of ele.attributes)
        {
            o[attr.name] = attr.value;
        }

    result.setRef(o);
};
