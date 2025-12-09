const
    inObj = op.inObject("Object"),
    outKey = op.outNumber("Key");

inObj.onChange = function ()
{
    let obj = inObj.get();

    if (obj)
    {
        for (let i in obj)
        {
            outKey.set(i);
        }
    }
};
