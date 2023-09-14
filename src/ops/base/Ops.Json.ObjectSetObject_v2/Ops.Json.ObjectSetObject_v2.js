const
    inObject = op.inObject("Object"),
    inKey = op.inString("Key"),
    inValue = op.inObject("Object Value"),
    outObject = op.outObject("Result Object");

inObject.onLinkChanged =
    inValue.onChange =
    outObject.onLinkChanged =
    inObject.onChange = update;

function update()
{
    const obj = inObject.get() || {};

    const newObj = JSON.parse(JSON.stringify(obj));

    newObj[inKey.get()] = inValue.get();

    outObject.setRef(newObj);
}

inKey.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inKey.get() });
    update();
};
