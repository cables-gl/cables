const
    index = op.inValueInt("index", 0.0),
    seed = op.inValueFloat("random seed"),
    min = op.inValueFloat("Min", 0),
    max = op.inValueFloat("Max", 1),
    outX = op.outValue("X"),
    outY = op.outValue("Y"),
    outZ = op.outValue("Z"),
    inInteger = op.inValueBool("Integer", false);

let arr = [];
let numValues = 100;
seed.set(Math.round(Math.random() * 99999));

op.setPortGroup("Value Range", [min, max]);

index.onChange = update;

init();

op.init = inInteger.onChange =
max.onChange = min.onChange =
seed.onChange = inInteger.onChange = function ()
{
    init();
    update();
};

function update()
{
    let idx = Math.floor(index.get()) || 0;
    if (idx * 3 >= arr.length)
    {
        numValues = idx + 100;
        init();
    }

    idx *= 3;

    outX.set(arr[idx + 0]);
    outY.set(arr[idx + 1]);
    outZ.set(arr[idx + 2]);
}

function init()
{
    Math.randomSeed = seed.get();
    let isInteger = inInteger.get();
    let inMin = min.get();
    let inMax = max.get();
    arr.length = Math.floor(numValues * 3) || 300;

    if (!isInteger)
    {
        for (var i = 0; i < arr.length; i += 3)
        {
            arr[i + 0] = Math.seededRandom() * (inMax - inMin) + inMin;
            arr[i + 1] = Math.seededRandom() * (inMax - inMin) + inMin;
            arr[i + 2] = Math.seededRandom() * (inMax - inMin) + inMin;
        }
    }
    else
    {
        for (var i = 0; i < arr.length; i += 3)
        {
            arr[i + 0] = Math.floor(Math.seededRandom() * ((inMax - inMin) + 1) + inMin);
            arr[i + 1] = Math.floor(Math.seededRandom() * ((inMax - inMin) + 1) + inMin);
            arr[i + 2] = Math.floor(Math.seededRandom() * ((inMax - inMin) + 1) + inMin);
        }
    }
}
