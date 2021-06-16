const
    exec = op.inTrigger("Merge"),
    next = op.outTrigger("Next");

const numArrays = 12;
const inArrs = [];
let needsUpdate = true;

for (let i = 0; i < numArrays; i++)
{
    inArrs[i] = op.inArray("Array " + i);
    inArrs[i].onChange = () =>
    {
        needsUpdate = true;
    };
}

const
    outArr = op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

let arr = [];

exec.onTriggered = () =>
{
    if (needsUpdate)
    {
        arr.length = 0;

        for (let i = 0; i < numArrays; i++)
        {
            const ar = inArrs[i].get();
            if (ar)arr = arr.concat(ar);
        }

        outArr.set(null);
        outArr.set(arr);
        outArrayLength.set(arr.length);
    }

    next.trigger();
};
