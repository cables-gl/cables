const
    inObj = op.inObject("Object"),
    outKeys = op.outArray("Keys"),
    outNumKeys = op.outNumber("Num Keys");

inObj.onChange = function ()
{
    let o = inObj.get();
    if (!o)
    {
        outNumKeys.set(0);
        outKeys.set([]);
        return;
    }

    let keys = Object.keys(o);
    outNumKeys.set(keys.length);
    outKeys.set(keys);
};
