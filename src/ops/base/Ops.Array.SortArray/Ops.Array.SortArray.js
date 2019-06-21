const arrayIn = op.inArray("Array to sort"),
    sortMode = op.inSwitch("Sorting mode",["Sort ascending","Sort descending"],"Sort ascending"),
    arrayOut = op.outArray("Sorted array");

var arrOut = [];

arrayIn.onChange = sortMode.onChange = update;
update();

function update()
{
    var arrIn = arrayIn.get();

    arrOut.length = 0;

    if(!arrIn)
    {
        arrayOut.set(null);
        return;
    }

    arrOut.length = arrIn.length;

    var i;
    for(i = 0; i < arrIn.length;i++)
    {
        arrOut[i] = arrIn[i];
    }

    if(sortMode.get() === "Sort ascending")
    {
        arrOut.sort(function(a, b){return a-b});
    }
    else
    {
        arrOut.sort(function(a, b){return b-a});
    }

    arrayOut.set(null);
    arrayOut.set(arrOut);
};
