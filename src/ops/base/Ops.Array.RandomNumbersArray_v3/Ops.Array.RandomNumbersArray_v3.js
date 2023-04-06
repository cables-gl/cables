const
    numValues = op.inValueInt("numValues", 10),
    min = op.inValueFloat("Min", 0),
    max = op.inValueFloat("Max", 1),
    seed = op.inValueFloat("random seed", 1),
    values = op.outArray("values"),
    outArrayLength = op.outNumber("Array length"),
    inInteger = op.inValueBool("Integer", false);

values.ignoreValueSerialize = true;
op.setPortGroup("Value Range", [min, max]);
op.setPortGroup("", [seed]);

max.onChange =
    min.onChange =
    numValues.onChange =
    seed.onChange =
    values.onLinkChanged =
    inInteger.onChange = init;

let arr = [];
init();

function init()
{
    Math.randomSeed = seed.get();
    let isInteger = inInteger.get();

    let arrLength = arr.length = Math.max(0, Math.abs(parseInt(numValues.get() || 0)));

    let minIn = min.get();
    let maxIn = max.get();

    if (arrLength === 0)
    {
        values.set(null);
        outArrayLength.set(0);
        return;
    }
    if (!isInteger)
    {
        for (var i = 0; i < arrLength; i++)
        {
            arr[i] = Math.seededRandom() * (maxIn - minIn) + minIn;
        }
    }
    else
    {
        for (var i = 0; i < arrLength; i++)
        {
            arr[i] = Math.floor(Math.seededRandom() * ((maxIn - minIn) + 1) + minIn);
        }
    }

    values.set(null);
    values.set(arr);
    outArrayLength.set(arrLength);
}
