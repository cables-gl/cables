const
    inArray = op.inArray("Array"),
    inIndex = op.inInt("Index", 0),
    inValueX = op.inFloat("Value X", 1),
    inValueY = op.inFloat("Value Y", 1),
    inValueZ = op.inFloat("Value Z", 1),
    inValueW = op.inFloat("Value W", 1),
    outArray = op.outArray("Result", null, 4);

let arr = [];
op.toWorkPortsNeedToBeLinked(inArray);

inArray.onChange =
    inIndex.onChange =
    inValueX.onChange =
    inValueY.onChange =
    inValueZ.onChange =
    inValueW.onChange = update;

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

    for (let i = 0; i < srcArr.length; i += 4)
    {
        if (idx == i / 4)
        {
            arr[i + 0] = inValueX.get();
            arr[i + 1] = inValueY.get();
            arr[i + 2] = inValueZ.get();
            arr[i + 3] = inValueW.get();
        }
        else
        {
            arr[i] = srcArr[i];
            arr[i + 0] = srcArr[i + 0];
            arr[i + 1] = srcArr[i + 1];
            arr[i + 2] = srcArr[i + 2];
            arr[i + 3] = srcArr[i + 3];
        }
    }

    outArray.setRef(arr);
}
