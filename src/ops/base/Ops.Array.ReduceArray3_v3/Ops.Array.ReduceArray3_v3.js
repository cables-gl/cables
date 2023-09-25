const
    arr = op.inArray("Array"),
    inMeth = op.inSwitch("Remove", ["Xth Item", "Random", "Duplicates"], "Xth Item"),
    num = op.inValueInt("Every xth Item", 2),
    inThresh = op.inFloatSlider("Threshold", 0.5),
    inSeed = op.inFloat("Seed", 1),
    outArr = op.outArray("Result Array");

num.onChange =
    inThresh.onChange =
    inSeed.onChange =
    arr.onChange = update;

let updateMethod = updateXth;

inMeth.onChange = () =>
{
    if (inMeth.get() == "Xth Item")updateMethod = updateXth;
    if (inMeth.get() == "Random")updateMethod = updateRandom;
    if (inMeth.get() == "Duplicates")updateMethod = updateDupes;

    update();
};

function update()
{
    const theArray = arr.get();
    if (!theArray) return;

    let newArray = updateMethod(theArray);

    outArr.setRef(newArray);
}

function updateDupes(theArray)
{
    const noDupesArr = [];

    for (let i = 0; i < theArray.length; i += 3)
    {
        let found = false;
        for (let j = 0; j < noDupesArr.length; j += 3)
        {
            if (
                theArray[i] == noDupesArr[j] &&
                theArray[i + 1] == noDupesArr[j + 1] &&
                theArray[i + 2] == noDupesArr[j + 2]
            )
            {
                found = true;
                break;
            }
        }

        if (!found)
        {
            noDupesArr.push(theArray[i], theArray[i + 1], theArray[i + 2]);
        }
    }
    return noDupesArr;
}

function updateRandom(theArray)
{
    Math.randomSeed = inSeed.get();

    const newArray = [];

    const thresh = inThresh.get();

    for (let i = 0; i < theArray.length; i += 3)
    {
        if (Math.seededRandom() > thresh)
            newArray.push(theArray[i + 0], theArray[i + 1], theArray[i + 2]);
    }

    return newArray;
}

function updateXth(theArray)
{
    const step = Math.max(0, Math.floor(num.get()));
    const newArray = [];

    if (step === 0)
    {
        outArr.setRef([]);
        return;
    }

    for (let i = 0; i < theArray.length; i += step * 3)
        newArray.push(theArray[i + 0], theArray[i + 1], theArray[i + 2]);

    return newArray;
}
