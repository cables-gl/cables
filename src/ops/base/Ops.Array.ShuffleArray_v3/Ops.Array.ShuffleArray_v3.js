const
    inArr = op.inArray("Array3"),
    inSeed = op.inFloat("Seed", 1),
    outArr = op.outArray("Result");

let newArr = [];
let rndArr = [];
inArr.onChange = update;
inSeed.onChange = update;

function fisherYatesShuffle(array)
{
    let i = 0;
    let j = 0;
    let temp = null;

    for (i = array.length - 1; i > 0; i -= 1)
    {
        j = Math.floor(Math.seededRandom() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function update()
{
    const arr = inArr.get();

    if (!arr)
    {
        outArr.set(null);
        return;
    }
    if (arr.length != newArr.length)
    {
        rndArr.length =
        newArr.length = arr.length;
    }

    let j = 0;
    let temp = null;
    Math.setRandomSeed(inSeed.get());

    for (let i = 0; i < arr.length; i++)
    {
        rndArr[i] = i;
    }

    fisherYatesShuffle(rndArr);

    for (let i = 0; i < arr.length; i++)
    {
        j = rndArr[i];
        newArr[i] = arr[j];
    }

    outArr.setRef(newArr);
}
