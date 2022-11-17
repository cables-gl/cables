const inArray = op.inArray("Array"),
    inNum = op.inValueInt("Elements", 10),
    inSeed = op.inValue("Seed", 1),
    result = op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

let arr = [];
inSeed.onChange = inArray.onChange = inNum.onChange = update;

function update()
{
    if (Math.floor(inNum.get()) < 0 || !inArray.get())
    {
        result.set(null);
        outArrayLength.set(0);
        return;
    }

    let oldArr = inArray.get();

    arr.length = Math.floor(inNum.get());

    let nums = [];

    for (var i = 0; i < Math.max(arr.length, oldArr.length); i++)
        nums[i] = i % (oldArr.length);

    nums = CABLES.shuffleArray(nums);

    Math.randomSeed = inSeed.get();

    for (var i = 0; i < inNum.get(); i++)
    {
        let index = nums[i];
        arr[i] = oldArr[index];
    }
    result.set(null);
    result.set(arr);
    outArrayLength.set(arr.length);
}
