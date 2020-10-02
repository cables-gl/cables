const passThrough = op.inValueBool("Pass Through", true),
    arrayIn = op.inArray("Array in"),
    arrayOut = op.outArray("Array Out");

let oldArr = null;

function copyArray(source)
{
    if (!source) return null;
    const dest = [];
    dest.length = source.length;
    for (let i = 0; i < source.length; i++)
    {
        dest[i] = source[i];
    }
    return dest;
}

arrayIn.onChange = passThrough.onChange = function ()
{
    if (passThrough.get())
    {
        oldArr = copyArray(arrayIn.get());
        arrayOut.set(oldArr);
    }
    else
    {
        arrayOut.set(oldArr);
    }
};
