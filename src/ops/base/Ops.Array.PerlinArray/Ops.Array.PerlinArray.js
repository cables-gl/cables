const inArraySeed = op.inArray("Array seed"),
    inTime = op.inFloat("Time in",0),
    seed = op.inFloatSlider("Seed 0-1",0.0),
    inMultiplier = op.inFloat("Multiplier",1),
    outArray = op.outArray("Array out");

var newArr=[];
outArray.set(newArr);

seed.set(Math.random());

inArraySeed.onChange = inTime.onChange = inMultiplier.onChange = update;

seed.onChange = function ()
{
    Math.randomSeed=seed.get();
    noise.seed(Math.seededRandom());
    update();
}

function update()
{
    var arr=inArraySeed.get();
    if(!arr)
    {
        outArray.set(null);
        return;
    }

    if(newArr.length!=arr.length)newArr.length=arr.length;

    var time = inTime.get();
    var mult = inMultiplier.get();

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = noise.perlin2(arr[i] * mult,time);
    }

    outArray.set(null);
    outArray.set(newArr);
}

