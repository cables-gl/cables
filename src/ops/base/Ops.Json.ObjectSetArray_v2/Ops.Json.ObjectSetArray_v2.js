const
    inObject = op.inObject("Object"),
    outObject = op.outObject("Result Object"),
    inKey = op.inString("Key"),
    inValue = op.inArray("Value");

inObject.onChange =
    inValue.onChange = update;
inKey.setUiAttribs({ "stringTrim": true, "minLength": 1 });


function update()
{
    const obj = inObject.get() || {};

    op.setUiError("id", null);
    if(inKey.get()=="")op.setUiError("id", "Key needs value");

    const newObj = JSON.parse(JSON.stringify(obj));

    if (inKey.get()) newObj[inKey.get()] = inValue.get();

    outObject.setRef(newObj);
}

inKey.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inKey.get() });
    update();
};
