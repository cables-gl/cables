const
    inArr = op.inArray("Array3"),
    inSeed = op.inFloat("Seed", 0),
    inStride = op.inInt("Stride", 1),
    outArr = op.outArray("Result");

let newArr = [];
let rndArr = [];

inStride.onChange =
    inArr.onChange =
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
    let stride = Math.max(1, Math.floor(inStride.get()));

    if (!arr)
    {
        outArr.set([]);
        return;
    }

    rndArr.length = Math.floor(arr.length / stride);
    newArr.length = Math.floor(arr.length / stride) * stride;

    let j = 0;
    Math.setRandomSeed(inSeed.get());

    for (let i = 0; i < newArr.length / stride; i++)
    {
        rndArr[i] = i * stride;
    }

    fisherYatesShuffle(rndArr);

    for (let i = 0; i < newArr.length; i += stride)
    {
        j = rndArr[i / stride];
        for (let k = 0; k < stride; k++)
        {
            newArr[i + k] = arr[j + k];
        }
    }

    outArr.setUiAttribs({ "stride": stride });
    outArr.setRef(newArr);
}
