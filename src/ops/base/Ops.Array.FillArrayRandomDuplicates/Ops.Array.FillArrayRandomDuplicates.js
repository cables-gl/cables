const
    inArr = op.inArray("Array"),
    inNum = op.inValueInt("Num Elements", 1000),
    inCalc = op.inTriggerButton("Calculate"),
    inShuffleAll = op.inBool("Shuffle all"),
    inSeed = op.inValueFloat("Random seed"),
    outArr = op.outArray("Result");
op.toWorkPortsNeedToBeLinked(inArr);

let arr = [];

inCalc.onTriggered = function ()
{
    let num = inNum.get();

    arr.length = num;

    let oldArr = inArr.get();
    if (!oldArr)
    {
        outArr.set(null);
        return;
    }
    let numOld = oldArr.length;

    let i = 0;
    if (!inShuffleAll.get())
        for (i = 0; i < numOld; i++)
            arr[i] = oldArr[i];

    Math.randomSeed = inSeed.get();

    while (i < (num - 1))
    {
        let ind = Math.floor(Math.seededRandom() * numOld);

        arr[i + 0] = oldArr[ind];
        i++;
    }

    outArr.setRef(arr);
};
