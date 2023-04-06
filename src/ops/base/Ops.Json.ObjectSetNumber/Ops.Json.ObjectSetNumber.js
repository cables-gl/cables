const
    inObject = op.inObject("Object"),
    outObject = op.outObject("Result Object"),
    inKey = op.inString("Key"),
    inValue = op.inValueFloat("Number");

inObject.onChange =
    inValue.onChange = update;

function update()
{
    let obj = inObject.get();
    if (!obj)obj = {};

    obj[inKey.get()] = inValue.get();

    outObject.setRef(obj);
}

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
