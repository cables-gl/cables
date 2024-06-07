const
    inArray = op.inArray("Array"),
    inIndex = op.inInt("Index", 0),
    inValue = op.inString("Value", ""),
    outArray = op.outArray("Result");

let arr = [];
op.toWorkPortsNeedToBeLinked(inArray);

inArray.onChange =
    inIndex.onChange =
    inValue.onChange = update;

function update()
{
    const srcArr = inArray.get();

    if (!srcArr)
    {
        outArray.set(null);
        return;
    }

    arr.length = srcArr.length;
    const idx = inIndex.get();

    for (let i = 0; i < srcArr.length; i++)
    {
        if (idx === i)arr[i] = inValue.get();
        else arr[i] = srcArr[i];
    }

    outArray.setRef(arr);
}
