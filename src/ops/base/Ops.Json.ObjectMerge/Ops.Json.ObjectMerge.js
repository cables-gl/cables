const
    inObj1 = op.inObject("Object 1"),
    inObj2 = op.inObject("Object 2"),
    outObj = op.outObject("Object Result");

function copy(src, dst)
{
    if (!src) return;

    for (const i in src)
    {
        dst[i] = src[i];
    }
}

inObj1.onChange =
inObj2.onChange = () =>
{
    const newObj = {};

    copy(inObj1.get(), newObj);
    copy(inObj2.get(), newObj);

    outObj.setRef(newObj);
};
