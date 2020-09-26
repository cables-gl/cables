const inArray = op.inArray("array");
const inDedupeMode = op.inSwitch("Format", ["X", "XY", "XYZ"], "X");
const outArray = op.outArray("arrayOut");
const outLength = op.outNumber("Array Length Out");

inArray.onChange = inDedupeMode.onChange = () =>
{
    if (!inArray.get())
    {
        outArray.set(null);
        outLength.set(0);
        return;
    }

    const mode = inDedupeMode.get();
    const func = FUNCTIONS[mode];
    const newArray = func(inArray.get());

    outArray.set(null);
    outArray.set(newArray);
    outLength.set(newArray.length);
};

function compareSingle(arr)
{
    const len = arr.length;
    const seen = {};
    const deduped = [];

    for (let i = 0; i < len; i++)
    {
        if (!seen[arr[i]])
        {
            deduped.push(arr[i]);
            seen[arr[i]] = true;
        }
    }

    return deduped;
}

const FUNCTIONS = {
    "X": compareSingle,
    "XY": compareVec2,
    "XYZ": compareVec3,
};

function compareVec2(arr)
{
    const len = Math.floor(arr.length / 2);
    const seen = {};
    const deduped = [];

    for (let i = 0; i < len; i += 1)
    {
        const key = [arr[i * 2], arr[i * 2 + 1]].join();

        if (!seen[key])
        {
            deduped.push(arr[i * 2], arr[i * 2 + 1]);
            seen[key] = true;
        }
    }

    return deduped;
}

function compareVec3(arr)
{
    const len = Math.floor(arr.length / 3);
    const seen = {};
    const deduped = [];

    for (let i = 0; i < len; i += 1)
    {
        const key = [arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]].join();

        if (!seen[key])
        {
            deduped.push(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]);
            seen[key] = true;
        }
    }

    return deduped;
}


/*
// OLD CODE IN CASE OF SOMETHING GOING WRONG

const inArray = op.inArray("array");
const outArray = op.outArray("arrayOut");

inArray.onChange = function ()
{
    const inValue = inArray.get();
    if (Array.isArray(inValue))
    {
        const unique = inValue.filter((v, i, a) => a.indexOf(v) === i);
        outArray.set(unique);
    }
    else
    {
        outArray.set(inValue);
    }
};

*/
