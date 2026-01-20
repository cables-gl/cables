const
    inArrayLeft = op.inArray("Array"),
    inArrayStrings = op.inArray("Values"),
    outArr = op.outArray("Result");

inArrayLeft.onChange =
inArrayStrings.onChange = update;

function update()
{
    const arr = [];
    const left = inArrayLeft.get();
    const strings = inArrayStrings.get();

    if (!left || !strings)
    {
        outArr.setRef([]);
        return;
    }

    for (let i = 0; i < left.length; i++)
    {
        if (strings.includes(left[i])) arr.push(left[i]);
    }

    outArr.setRef(arr);
}
