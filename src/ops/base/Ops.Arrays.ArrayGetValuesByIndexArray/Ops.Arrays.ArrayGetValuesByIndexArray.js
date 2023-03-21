const inArr = op.inArray("Array");
const inStride = op.inSwitch("Array Stride", ["1", "2", "3", "4"], "1");
const inIdx = op.inArray("Indices");

const outArr = op.outArray("Results");

op.toWorkPortsNeedToBeLinked(inArr, inIdx);

inArr.onChange = inStride.onChange = inIdx.onChange = () =>
{
    const arr = inArr.get();
    if (!arr)
    {
        outArr.set(null);
        return;
    }

    const idx = inIdx.get();
    if (!idx)
    {
        outArr.set(null);
        return;
    }

    const res = [];
    const stride = parseInt(inStride.get());
    for (let i = 0; i < idx.length; i++)
    {
        const k = idx[i] * stride;

        if (stride == 1)
        {
            res.push(arr[k]);
        }
        else
        {
            for (let j = 0; j < stride; j++)
            {
                res.push(arr[k + j]);
            }
        }
    }

    outArr.setRef(res);
};
