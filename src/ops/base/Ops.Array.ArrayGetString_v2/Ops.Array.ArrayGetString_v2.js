const
    array = op.inArray("Array"),
    index = op.inValueInt("Index"),
    result = op.outString("Result"),
    found = op.outBoolNum("Found");

array.ignoreValueSerialize = true;
op.toWorkPortsNeedToBeLinked(array);

array.onChange =
index.onChange = update;

function update()
{
    const arr = array.get();
    if (arr)
    {
        const value = arr[index.get()];
        const isNull = value === undefined || value === null;
        if (isNull)
        {
            result.set("");
            found.set(false);
        }
        else
        {
            result.set(value);
            found.set(true);
        }
    }
    else
    {
        result.set("");
        found.set(false);
    }
}
