const
    inArr = op.inArray("Array"),
    inKey = op.inString("Key"),
    inType = op.inSwitch("Type", ["Numbers", "Strings"], "Numbers"),
    inReverse = op.inBool("Reverse", false),
    outArr = op.outArray("Result");

inReverse.onChange =
inType.onChange =
inArr.onChange =
inKey.onChange = () =>
{
    const k = inKey.get();
    const arr = JSON.parse(JSON.stringify(inArr.get())) || [];

    if (inType.get() == "Strings")
        arr.sort((a, b) =>
        {
            return (String(a[k])).localeCompare(String(b[k]));
        });
    if (inType.get() == "Numbers")
        arr.sort((a, b) =>
        {
            return (a[k] || 0) - ((b[k] || 0));
        });

    if (arr && inReverse.get())arr.reverse();
    outArr.set(arr);
};
