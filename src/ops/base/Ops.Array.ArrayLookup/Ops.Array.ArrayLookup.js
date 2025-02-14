const
    inArrayIndices = op.inArray("Indices"),
    inArrayValues = op.inArray("Values"),
    inStride = op.inInt("Stride", 1),
    outArr = op.outArray("Result");

inStride.onChange =
inArrayValues.onChange =
inArrayIndices.onChange = update;

function update()
{
    const arr = [];
    const indices = inArrayIndices.get();
    const values = inArrayValues.get();
    const stride = inStride.get();

    outArr.setUiAttribs({ "stride": stride });

    if (!indices || !values)
    {
        outArr.setRef([]);
        return;
    }

    for (let i = 0; i < indices.length; i++)
    {
        for (let s = 0; s < stride; s++)
        {
            const idx = indices[i] * stride + s;
            arr.push(values[idx] || 0);
        }
    }

    outArr.setRef(arr);
}
