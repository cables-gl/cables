const
    inArr=op.inArray("Array3"),
    inSeed=op.inFloat("Seed",5711),
    outArr=op.outArray("Result");

var newArr=[];
var rndArr=[];
inArr.onChange=update;
inSeed.onChange=update;

function fisherYatesShuffle(array)
{
    var i = 0;
    var j = 0;
    var temp = null;

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

    if(!arr)
    {
        outArr.set(null);
        return;
    }
    if(arr.length!=newArr.length) newArr.length = arr.length;

    var i = 0;
    var j = 0;
    var temp = null;
    Math.randomSeed=inSeed.get();

    for (i = 0; i < arr.length; i++)
    {
        rndArr[i]=i;
    }

    fisherYatesShuffle(rndArr);

    for (i = 0; i < arr.length; i ++)
    {
        j=rndArr[i];
        newArr[i] = arr[j];
    }

    outArr.set(null);
    outArr.set(newArr);
}

