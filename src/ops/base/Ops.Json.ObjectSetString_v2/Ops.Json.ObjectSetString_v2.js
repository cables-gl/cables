const
    inObject = op.inObject("Object"),
    outObject = op.outObject("Result Object"),
    inKey = op.inString("Key"),
    inValue = op.inString("Value");

inObject.onChange =
    inValue.onChange = update;

inKey.setUiAttribs({ "stringTrim": true, "minLength": 1 });

inKey.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inKey.get() });
    update();
};

function update()
{
    let obj = inObject.get();
    if (!obj) obj = {};

    const key = inKey.get();

    const newObj = JSON.parse(JSON.stringify(obj));

    if (key) newObj[key] = inValue.get();

    outObject.setRef(newObj);
}
