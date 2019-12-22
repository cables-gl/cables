const inArray = op.inArray("array");
const outObject = op.outObject("objectOut");

inArray.onChange = function ()
{
    const inValue = inArray.get();
    const counts = {};
    if (Array.isArray(inValue))
    {
        for (let i = 0; i < inValue.length; i++)
        {
            const value = inValue[i];
            if (counts.hasOwnProperty(value))
            {
                counts[value]++;
            }
            else
            {
                counts[value] = 1;
            }
        }
        outObject.set(counts);
    }
    else
    {
        outObject.set(inValue);
    }
};
