const
    inArr = op.inArray("Array"),
    inNum = op.inValueInt("Num Elements", 10),
    inSeed = op.inValueFloat("Random seed", 1),
    outArr = op.outArray("Result");

op.toWorkPortsNeedToBeLinked(inArr);

let arr = [];

inArr.onChange =
    inNum.onChange =
    inSeed.onChange = () =>
    {
        let oldArr = inArr.get();

        if (!oldArr) return outArr.set(null);

        let num = inNum.get();
        let numOld = oldArr.length;

        Math.randomSeed = inSeed.get();
        arr.length = num;

        for (let i = 0; i < num; i++)
        {
            let ind = Math.floor(Math.seededRandom() * numOld);
            arr[i] = oldArr[ind];
        }

        outArr.setRef(arr);
    };
