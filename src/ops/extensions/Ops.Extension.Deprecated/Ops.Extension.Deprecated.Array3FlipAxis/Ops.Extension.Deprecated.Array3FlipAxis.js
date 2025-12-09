const
    inArr = op.inArray("Points", 3),
    inAxis1 = op.inSwitch("Axis 1", ["X", "Y", "Z"], "X"),
    inAxis2 = op.inSwitch("Axis 2", ["X", "Y", "Z"], "Y"),
    inAxis3 = op.inSwitch("Axis 3", ["X", "Y", "Z"], "Z"),

    inFlipX = op.inBool("Flip Order X", false),
    inFlipY = op.inBool("Flip Order Y", false),
    inFlipZ = op.inBool("Flip Order Z", false),

    result = op.outArray("Result");

const arr = [];

inArr.onChange =
inFlipX.onChange =
inFlipY.onChange =
inFlipZ.onChange =
inAxis1.onChange =
inAxis2.onChange =
inAxis3.onChange = () =>
{
    const oldArr = inArr.get();
    if (!oldArr || oldArr.length == 0)
    {
        result.set(null);
        return;
    }

    arr.length = oldArr.length;

    let len = oldArr.length;

    if (inAxis1.get() == "X") for (let i = 0; i < len; i += 3) arr[i + 0] = oldArr[i + 0];
    if (inAxis1.get() == "Y") for (let i = 0; i < len; i += 3) arr[i + 0] = oldArr[i + 1];
    if (inAxis1.get() == "Z") for (let i = 0; i < len; i += 3) arr[i + 0] = oldArr[i + 2];

    if (inAxis2.get() == "X") for (let i = 0; i < len; i += 3) arr[i + 1] = oldArr[i + 0];
    if (inAxis2.get() == "Y") for (let i = 0; i < len; i += 3) arr[i + 1] = oldArr[i + 1];
    if (inAxis2.get() == "Z") for (let i = 0; i < len; i += 3) arr[i + 1] = oldArr[i + 2];

    if (inAxis3.get() == "X") for (let i = 0; i < len; i += 3) arr[i + 2] = oldArr[i + 0];
    if (inAxis3.get() == "Y") for (let i = 0; i < len; i += 3) arr[i + 2] = oldArr[i + 1];
    if (inAxis3.get() == "Z") for (let i = 0; i < len; i += 3) arr[i + 2] = oldArr[i + 2];

    const maxi = len;

    if (inFlipX.get())
        for (let i = 0; i < len / 2; i += 3)
        {
            const temp = arr[i + 0];
            arr[i + 0] = arr[len - i];
            arr[len - i] = temp;
        }

    if (inFlipY.get())
        for (let i = 0; i < len / 2; i += 3)
        {
            const temp = arr[i + 1];
            arr[i + 1] = arr[(len - i) + 1];
            arr[(len - i) + 1] = temp;
        }

    if (inFlipZ.get())
        for (let i = 0; i < len / 2; i += 3)
        {
            const temp = arr[i + 2];
            arr[i + 2] = arr[(len - i) + 2];
            arr[(len - i) + 2] = temp;
        }

    result.set(null);
    result.set(arr);
};
