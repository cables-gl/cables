const
    inIndex = op.inValue("Index Position"),
    inArr = op.inArray("Array"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z");

inIndex.onChange = inArr.onChange = function ()
{
    let i = inIndex.get();
    const arr = inArr.get();

    if (i < 0 || !arr)
    {
        return;
    }

    const maxIdx = Math.floor((arr.length / 3) - 1);
    const intIdx = Math.floor(inIndex.get());
    if (intIdx == maxIdx)
    {
        outX.set(arr[arr.length - 3]);
        outY.set(arr[arr.length - 2]);
        outZ.set(arr[arr.length - 1]);
        return;
    }

    const fr = inIndex.get() - Math.floor(inIndex.get());
    i = Math.floor((inIndex.get())) * 3;
    i %= (arr.length);

    let x = arr[i + 0];
    let y = arr[i + 1];
    let z = arr[i + 2];

    const x2 = arr[i + 3];
    const y2 = arr[i + 4];
    const z2 = arr[i + 5];

    x += (x2 - x) * fr;
    y += (y2 - y) * fr;
    z += (z2 - z) * fr;

    outX.set(x);
    outY.set(y);
    outZ.set(z);
};
