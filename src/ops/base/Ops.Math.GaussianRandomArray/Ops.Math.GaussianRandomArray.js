const
    inNum = op.inValueInt("Num", 100),
    outArr = op.outArray("Array"),
    inDev = op.inValue("Deviation", 1),
    seed = op.inValueFloat("Random Seed");

let arr = [];
let stdDev = 1;
let previous = false;
let nextGaussian = null;
let y2;

seed.onChange = inDev.onChange = inNum.onChange = update;
update();

// from https://github.com/processing/p5.js/blob/master/src/math/random.js

function randomGaussian(mean, sd)
{
    let y1, x1, x2, w;
    if (previous)
    {
        y1 = y2;
        previous = false;
    }
    else
    {
        do
        {
            x1 = Math.seededRandom() * 2 - 1;
            x2 = Math.seededRandom() * 2 - 1;
            w = x1 * x1 + x2 * x2;
        } while (w >= 1);
        w = Math.sqrt((-2 * Math.log(w)) / w);
        y1 = x1 * w;
        y2 = x2 * w;
        previous = true;
    }

    let m = mean || 0;
    let s = sd || 1;
    return y1 * s + m;
}

function update()
{
    stdDev = inDev.get();
    Math.randomSeed = seed.get();

    arr.length = Math.floor(inNum.get()) || 0;
    for (let i = 0; i < arr.length; i++)
    {
        arr[i] = randomGaussian(0, stdDev);
    }

    outArr.set(null);
    outArr.set(arr);
}
