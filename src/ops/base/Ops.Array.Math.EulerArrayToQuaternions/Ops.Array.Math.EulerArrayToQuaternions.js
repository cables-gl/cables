const
    inArr = op.inArray("Euler Array"),
    outArr = op.outArray("Quaternions");

inArr.onChange = () =>
{
    const arr = inArr.get() || [];
    const rarr = [];

    const quatOut = quat.create();

    for (let i = 0; i < arr.length; i += 3)
    {
        quat.fromEuler(quatOut, arr[i + 0], arr[i + 1], arr[i + 2], "xyz");
        rarr.push(quatOut[0], quatOut[1], quatOut[2], quatOut[3]);
    }

    outArr.setRef(rarr);
};
