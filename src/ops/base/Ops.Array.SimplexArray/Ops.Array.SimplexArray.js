const
    inArrayX = op.inArray("Array in X "),
    inTimeArray = op.inArray("Array time"),
    inTime = op.inFloat("Time in Y", 0),
    seed = op.inFloatSlider("Seed 0-1", 0.5),
    inFrequency = op.inFloat("Frequency", 10),
    outArray = op.outArray("Array out"),
    outArrayLength = op.outNumber("Array length out");

let showingError = false;

let newArr = [];
outArray.set(newArr);

seed.set(Math.random());

seed.onChange =
    inArrayX.onChange =
    inTime.onChange =
    inFrequency.onChange = update;

function update()
{
    let arr = inArrayX.get();
    let arrTime = inTimeArray.get();

    let time = inTime.get();
    let mult = inFrequency.get();

    Math.randomSeed = seed.get();
    noise.seed(Math.seededRandom());

    if (arrTime)
    {
        if (!arr || !arrTime)
        {
            outArray.set(null);
            return;
        }
        if (arr.length != arrTime.length)
        {
            if (!showingError)
            {
                op.uiAttr({ "error": "Arrays do not have the same length !" });
                outArrayLength.set(0);
                showingError = true;
            }
            outArray.set(null);
            return;
        }
        if (showingError)
        {
            showingError = false;
            op.uiAttr({ "error": null });
        }

        if (newArr.length != arr.length)newArr.length = arr.length;

        for (var i = 0; i < arr.length; i++)
        {
            newArr[i] = noise.simplex2(arr[i] * mult, arrTime[i] + time);
        }
    }
    else if (!arrTime)
    {
        if (!arr)
        {
            outArray.set(null);
            return;
        }

        if (newArr.length != arr.length)newArr.length = arr.length;

        for (var i = 0; i < arr.length; i++)
        {
            newArr[i] = noise.simplex2(arr[i] * mult, time);
        }
    }

    outArray.set(null);
    outArray.set(newArr);
    outArrayLength.set(newArr.length);
}
