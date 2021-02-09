function closest(num, arr)
{
    let curr = arr[0];
    let diff = Math.abs(num - curr);
    for (let val = 0; val < arr.length; val++)
    {
        let newdiff = Math.abs(num - arr[val]);
        if (newdiff < diff)
        {
            diff = newdiff;
            curr = arr[val];
        }
    }

    return curr;
}

const inValue = op.inFloat("Value", 0);
const inScale = op.inArray("Scale Array Input");
const outQuantized = op.outNumber("Quantized Value");

inValue.onChange = () =>
{
    if (!inScale.get())
    {
        outQuantized.set(0);
        return;
    }

    const arr = inScale.get();
    const quantized = closest(inValue.get(), arr);
    outQuantized.set(quantized);
};
