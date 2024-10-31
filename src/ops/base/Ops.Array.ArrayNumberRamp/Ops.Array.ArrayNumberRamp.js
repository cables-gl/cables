const
    inStart = op.inFloat("Start Value", 0),
    inEnd = op.inFloat("End Value", 1),
    inNum = op.inInt("Entries", 10),
    outArr = op.outArray("Result");

inStart.onChange =
    inEnd.onChange =
    inNum.onChange = update;

update();

function update()
{
    const start = inStart.get();
    const end = inEnd.get();

    const num = Math.floor(Math.max(0, inNum.get()));

    if (num === 0)
    {
        outArr.setRef([]);
        return;
    }

    const arr = [];

    if (num === 1)
    {
        arr.push(start); // Or choose to push 'end' if preferred
        outArr.setRef(arr);
        return;
    }

    const dist = end - start;
    const step = dist / (num - 1);

    for (let i = 0; i < num; i++)
    {
        arr[i] = start + i * step;
    }

    outArr.setRef(arr);
}
