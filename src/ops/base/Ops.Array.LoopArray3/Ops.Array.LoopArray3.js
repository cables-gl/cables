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

    for (var i = 0; i < newArray.length; i+=3)
    {
        if(i < newArray.length-3 )
        {
            newArray[i]   = arr[i];
            newArray[i+1] = arr[i+1];
            newArray[i+2] = arr[i+2];
        }
        else if(i === newArray.length-3)
        {
            newArray[arr.length-3] = arr[0];
            newArray[arr.length-3+1] = arr[1];
            newArray[arr.length-3+2] = arr[2];
        }
    }
    outArray.set(null);
    outArray.set(newArray);
}