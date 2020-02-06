const inArrayX = op.inArray("Array in X"),
    inTimeArray = op.inArray("Array time"),
    inTime = op.inFloat("Time in Y",0),
    seed = op.inFloatSlider("Seed 0-1",0.0),
    inFrequency = op.inFloat("Frequency",10),
    outArray = op.outArray("Array out"),
    outArrayLength = op.outNumber("Array length out");

var showingError=false;

var newArr=[];
var tempTimeArray=[];
outArray.set(newArr);

seed.set(Math.random());

inArrayX.onChange=inTimeArray.onChange=inTime.onChange=inFrequency.onChange=update;

seed.onChange = function ()
{
    Math.randomSeed=seed.get();
    noise.seed(Math.seededRandom());
    update();
}

function update()
{
    var arr=inArrayX.get();
    var arrTime = inTimeArray.get();

    var time = inTime.get();
    var mult = inFrequency.get();

    if(arrTime)
    {
        if(!arr || !arrTime)
        {
            outArray.set(null);
            return;
        }
        if(arr.length != arrTime.length)
        {
            if(!showingError)
            {
                op.uiAttr({error:"Arrays do not have the same length !"});
                outArrayLength.set(0);
                showingError = true;
            }
            outArray.set(null);
            return;
        }
        if(showingError)
        {
            showingError = false;
            op.uiAttr({error:null});
        }

        if(newArr.length!=arr.length)newArr.length=arr.length;

        for(var i=0;i<arr.length;i++)
        {
            newArr[i] = noise.perlin2(arr[i] * mult,arrTime[i]+time);
        }
    }
    else if(!arrTime)
    {
        if(!arr)
        {
            outArray.set(null);
            return;
        }

        if(newArr.length!=arr.length)newArr.length=arr.length;

        for(var i=0;i<arr.length;i++)
        {
            newArr[i] = noise.perlin2(arr[i] * mult,time);
        }
    }

    outArray.set(null);
    outArray.set(newArr);
    outArrayLength.set(newArr.length);
}

