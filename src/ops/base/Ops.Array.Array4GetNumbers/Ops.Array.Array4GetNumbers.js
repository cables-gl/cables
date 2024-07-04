const
    pArr = op.inArray("Array"),
    pIndex = op.inValueInt("Index"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    outW = op.outNumber("W");

pArr.onChange =
    pIndex.onChange = update;

function update()
{
    let arr = pArr.get();
    if (!arr)
    {
        outX.set(0);
        outY.set(0);
        outZ.set(0);
        outW.set(0);
        return;
    }
    let ind = Math.min(arr.length - 4, pIndex.get() * 4);
    if (arr && arr.length > ind + 3)
    {
        outX.set(arr[ind + 0]);
        outY.set(arr[ind + 1]);
        outZ.set(arr[ind + 2]);
        outW.set(arr[ind + 3]);
    }
}
