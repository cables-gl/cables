const inArrayX = op.inArray("Array in X "),
    inTime = op.inFloat("Time in Y",0),
    seed = op.inFloatSlider("Seed 0-1",0.5),
    inFrequency = op.inFloat("Frequency",1),
    outArray = op.outArray("Array out");

var newArr=[];
outArray.set(newArr);

seed.set(Math.random());

inArrayX.onChange = inTime.onChange = inFrequency.onChange = update;

seed.onChange = function()
{
    Math.randomSeed=seed.get();
    noise.seed(Math.seededRandom());
    update();
}
function update()
{
    var arr=inArrayX.get();
    if(!arr)
    {
        outArray.set(null);
        return;
    }

    if(newArr.length!=arr.length)newArr.length=arr.length;

    var time = inTime.get();
    var mult = inFrequency.get();

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = noise.simplex2(arr[i] * mult,time);
    }

    outArray.set(null);
    outArray.set(newArr);
}

