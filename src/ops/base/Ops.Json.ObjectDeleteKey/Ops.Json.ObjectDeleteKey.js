const
    inObj1 = op.inObject("Object"),
    inKey = op.inString("Key", ""),
    outObj = op.outObject("Object Result");

inObj1.onChange = update;

inKey.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inKey.get() });
    update();
};

function update()
{
    const o = inObj1.get();

    if (!o)
    {
        outObj.set(null);
        return;
    }

    const newObj = JSON.parse(JSON.stringify(o));
    delete newObj[inKey.get()];

    outObj.setRef(newObj);
}
