const
    inExec = op.inTriggerButton("Exec"),
    inArr = op.inArray("Array"),
    inReset = op.inTriggerButton("Reset"),

    deflt = op.inArray("Default"),
    outArr = op.outArray("Result");


function copyArray(source)
{
    let dest = [];
    dest.length = source.length;
    for (let i = 0; i < source.length; i++)
    {
        dest[i] = source[i];
    }
    return dest;
}

inReset.onTriggered =
deflt.onChange = function ()
{
    let arr = deflt.get();
    outArr.set(null);
    if (arr) outArr.set(copyArray(arr));
};

inExec.onTriggered = function ()
{
    let arr = inArr.get();
    if (!arr || !arr.length) return;
    const cop = copyArray(arr);
    outArr.set(null);
    outArr.set(cop);
};
