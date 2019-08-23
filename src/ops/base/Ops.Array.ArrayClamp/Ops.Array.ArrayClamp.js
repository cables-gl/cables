const
    inArray = op.inArray("Array In"),
    inMinValue = op.inFloat("Min",0.0),
    inMaxValue = op.inFloat("Max",1.0),
    outArray = op.outArray("Array Out");

var newArr = [];
outArray.set(newArr);
inArray.onChange = inMinValue.onChange = inMaxValue.onChange = function()
{
    var arr = inArray.get();
    if(!arr)return;

    var inMin = inMinValue.get();
    var inMax = inMaxValue.get();

    if(newArr.length != arr.length)newArr.length = arr.length;

    var i = 0;
    for(i = 0;i < arr.length;i++)
    {
        newArr[i] = Math.min(Math.max(arr[i],inMin),inMax);
    }
    outArray.set(null);
    outArray.set(newArr);
};
