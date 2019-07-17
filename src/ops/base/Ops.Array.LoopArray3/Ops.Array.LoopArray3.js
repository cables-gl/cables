const inArray = op.inArray("Array in"),
    outArray = op.outArray("Array out");

var newArray = [];

inArray.onChange = function()
{
    var arr = inArray.get();
    if(!arr)
    {
        outArray.set(null);
        return;
    }

    if(newArray.length !== arr.length) newArray.length = arr.length;
    var i ;
    for (i = 0; i < newArray.length; i+=3)
    {
        newArray[i+0] = arr[i+0];
        newArray[i+1] = arr[i+1];
        newArray[i+2] = arr[i+2];
    }

    newArray[i+0] = arr[0];
    newArray[i+1] = arr[1];
    newArray[i+2] = arr[2];

    outArray.set(null);
    outArray.set(newArray);
}