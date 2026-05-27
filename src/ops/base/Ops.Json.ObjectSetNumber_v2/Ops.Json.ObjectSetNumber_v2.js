const
    inObject = op.inObject("Object"),
    outObject = op.outObject("Result Object"),
    inKey = op.inString("Key"),
    inValue = op.inFloat("Number");

inObject.onChange =
    inValue.onChange = update;

inKey.setUiAttribs({ "stringTrim": true, "minLength": 1 });
outObject.ignoreValueSerialize = true;
op.toWorkPortsNeedsString(inKey);

function update()
{
    let obj = inObject.get();
    if (!obj)obj = {};

    let newObj = null;
    try
    {
        newObj = structuredClone(obj);
    }
    catch (e)
    {
        newObj = JSON.parse(JSON.stringify(obj));
    }

    let v = inValue.get();
    if (!CABLES.isNumeric(v))
    {
        if (v === "" || v === false || v === "false" || v === null || v === undefined)v = 0;
        else v = 1;

    }

    newObj[inKey.get()] = v;

    outObject.setRef(newObj);
}

inKey.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inKey.get() });
    update();
};
