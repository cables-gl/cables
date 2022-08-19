const
    inObject = op.inObject("Object"),
    outObject = op.outObject("Result Object"),
    inKey = op.inString("Key"),
    inValue = op.inArray("Value");

inObject.onChange =
    inKey.onChange =
    inValue.onChange = update;

function update()
{
    let obj = inObject.get();
    if (!obj)obj = {};

    if (inKey.get()) obj[inKey.get()] = inValue.get();

    outObject.set(null);
    outObject.set(obj);
}
