const
    inArray = op.inArray("Array", 3),
    inNum = op.inValueInt("Elements", 10),
    inSeed = op.inValue("Seed", 1),
    result = op.outArray("Result"),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length");

let arr = [];
inSeed.onChange = inArray.onChange = inNum.onChange = update;

function update()
{
    if (Math.floor(inNum.get()) < 0 || !inArray.get())
    {
        result.set(null);
        outTotalPoints.set(0);
        outArrayLength.set(0);
        return;
    }

    let oldArr = inArray.get();

    arr.length = Math.floor(inNum.get() * 3);

    let nums = [];
    for (var i = 0; i < Math.max(arr.length / 3, oldArr.length / 3); i++)
        nums[i] = i % (oldArr.length / 3);

    Math.randomSeed = inSeed.get();
    nums = CABLES.shuffleArray(nums);

    for (var i = 0; i < inNum.get(); i++)
    {
        let index = nums[i] * 3;
        arr[i * 3 + 0] = oldArr[index + 0];
        arr[i * 3 + 1] = oldArr[index + 1];
        arr[i * 3 + 2] = oldArr[index + 2];
    }

    result.set(null);
    result.set(arr);
    outTotalPoints.set(arr.length / 3);
    outArrayLength.set(arr.length);
}
