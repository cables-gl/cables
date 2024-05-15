const
    inObject = op.inObject("Object"),
    inKey = op.inString("Key"),
    inValue = op.inObject("Object Value"),
    // inCopy=op.inBool("Deep Copy",false),
    outObject = op.outObject("Result Object");

inObject.onLinkChanged =
    // inCopy.onChange =
    inValue.onChange =
    outObject.onLinkChanged =
    inObject.onChange = update;

inKey.setUiAttribs({ "stringTrim": true, "minLength": 1 });

function update()
{
    const obj = inObject.get() || {};

    let newObj = obj;
    // if(inCopy.get())
    // newObj = JSON.parse(JSON.stringify(obj));

    newObj[inKey.get()] = inValue.get();

    outObject.setRef(newObj);
}

inKey.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inKey.get() });
    update();
};
