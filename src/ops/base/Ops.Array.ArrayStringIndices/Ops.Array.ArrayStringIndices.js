const inArr = op.inArray("Array");
const inValue = op.inString("SearchValue");
const outIndexes = op.outArray("Index", -1);
const outFound = op.outBoolNum("Found", false);

inValue.onChange =
inArr.onChange = exec;

function exec()
{
    let arr = inArr.get();
    const indexes = [];
    if (arr)
    {
        if (!Array.isArray(arr)) arr = Array.from(arr);
        for (let i = 0; i < arr.length; i++)
        {
            if (arr[i] === inValue.get())
            {
                indexes.push(i);
            }
        }
        outIndexes.setRef(indexes);
        outFound.set(indexes.length > 0);
    }
}
