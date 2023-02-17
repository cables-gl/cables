const
    inObject = op.inObject("Object"),
    outObject = op.outObject("Result Object"),
    inKey = op.inString("Key"),
    inValue = op.inString("Value");

inObject.onChange =
    inValue.onChange = update;

let oldKey = "";

inKey.onChange = () =>
{
    if (!inKey.isLinked())
    {
        let obj = inObject.get();

        if (obj) delete obj[oldKey];
        op.setUiAttrib({ "extendTitle": inKey.get() });
    }
    oldKey = inKey.get();
    update();
};

function update()
{
    let obj = inObject.get();
    if (!obj) obj = {};

    const key = inKey.get();

    if (key) obj[key] = inValue.get();

    outObject.setRef(obj);
}
