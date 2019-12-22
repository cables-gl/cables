const inArray = op.inArray("array");
const outArray = op.outArray("arrayOut");

inArray.onChange = function ()
{
    const inValue = inArray.get();
    if (Array.isArray(inValue))
    {
        const unique = inValue.filter((v, i, a) => a.indexOf(v) === i);
        outArray.set(unique);
    }
    else
    {
        outArray.set(inValue);
    }
};
