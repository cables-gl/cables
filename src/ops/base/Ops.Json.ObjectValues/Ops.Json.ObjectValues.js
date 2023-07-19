const
    inObj = op.inObject("Object"),
    outValues = op.outArray("Values"),
    outNumValues = op.outNumber("Num values");

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
