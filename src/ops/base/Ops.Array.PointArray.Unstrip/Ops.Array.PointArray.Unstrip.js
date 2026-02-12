const
    inArr = op.inArray("Array"),
    outArr = op.outArray("Result");

inArr.onChange = () =>
{
    const arr = inArr.get() || [];
    const r = [];

    let lastx = 0;
    let lasty = 0;
    let lastz = 0;

    for (let i = 0; i < arr.length; i += 3)
    {
        if (i > 0)
        {
            r.push(lastx, lasty, lastz);
            r.push(arr[i + 0], arr[i + 1], arr[i + 2]);
        }

        lastx = arr[i + 0];
        lasty = arr[i + 1];
        lastz = arr[i + 2];
    }
    outArr.setRef(r);
};
