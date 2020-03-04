const
    inArray = op.inArray("Array In"),
    inValue = op.inValue("Value",2.0),
    outArray = op.outArray("Array Out");

var newArr = [];
outArray.set(newArr);
inArray.onChange =
inValue.onChange = inArray.onChange = function()
{
    var arr = inArray.get();
    if(!arr)return;

    var modulo = inValue.get();

    if(newArr.length != arr.length) newArr.length = arr.length;

    var i = 0;
    for(i = 0;i < arr.length;i++)
    {
        newArr[i] = arr[i] % modulo;
    }
    outArray.set(null);
    outArray.set(newArr);
};