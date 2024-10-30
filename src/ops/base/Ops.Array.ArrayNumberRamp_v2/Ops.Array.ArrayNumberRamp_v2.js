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
    const start = Math.min(inStart.get(), inEnd.get());
    const end = Math.max(inStart.get(), inEnd.get());

    const num = Math.floor(Math.max(0, inNum.get()));

    const arr = [];

    if (num == 0) return outArr.setRef([]);
    const dist = Math.abs(end) + Math.abs(start);
    const step = dist / (num - 1);
    arr.length = num;

    for (let i = 0; i < num; i++)
    {
        arr[i] = i * step + start;
    }

    outArr.setRef(arr);
}
