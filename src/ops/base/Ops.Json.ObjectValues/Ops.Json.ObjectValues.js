const
    inObj = op.inObject("Object"),
    outNumValues = op.outValue("Num values"),
    outValues = op.outArray("Values");

inObj.onChange = () =>
{
    const sourceObj = inObj.get();
    if (!sourceObj)
    {
        outNumValues.set(0);
        outValues.set([]);
        return;
    }

    const values = Object.values(sourceObj);
    outNumValues.set(values.length);
    outValues.set(values);
};
