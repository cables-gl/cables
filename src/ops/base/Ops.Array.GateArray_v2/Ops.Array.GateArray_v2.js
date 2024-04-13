const
    arrayIn = op.inArray("Array in"),
    passThrough = op.inValueBool("Pass Through", true),
    inIfNull = op.inSwitch("When False", ["keep last array", "null"], "keep last array"),
    arrayOut = op.outArray("Array Out");

let oldArr = null;

function copyArray(source)
{
    if (!source) return null;
    const dest = [];
    dest.length = source.length;
    for (let i = 0; i < source.length; i++)
        dest[i] = source[i];

    return dest;
}

inIfNull.onChange =
    arrayIn.onChange =
    passThrough.onChange =
    function ()
    {
        if (passThrough.get())
        {
            oldArr = copyArray(arrayIn.get());
            arrayOut.setRef(oldArr);
        }
        else
        {
            if (inIfNull.get() == "null") arrayOut.setRef(null);
        }
    };
