const
    inArr = op.inArray("Array"),
    inChunks = op.inInt("Chunk Size", 3),
    inRepeats = op.inInt("Repeats", 10),
    outArr = op.outArray("Result");


inArr.onChange =
inChunks.onChange =
inRepeats.onChange = () =>
{
    let chu = inChunks.get();
    let reps = inRepeats.get();
    let arr = inArr.get();

    if (!arr) return;
    if (chu <= 0) return;
    if (chu <= 0) return;

    let rArr = [];
    let count = 0;

    for (let i = 0; i < arr.length; i += chu)
    {
        for (let r = 0; r < reps; r++)
        {
            for (let c = 0; c < chu; c++)
            {
                rArr[count] = arr[i + c];
                count++;
            }
        }
    }

    outArr.setRef(rArr);
};
