var inArray = op.inArray("Array In");
var inValue = op.inValue("Value",1.0);
var outArray = op.outArray("Array Out");

var newArr = [];
outArray.set(newArr);
inArray.onChange =
inValue.onChange = inArray.onChange = function()
{
    var arr = inArray.get();
    if(!arr)return;
    
    var inMax = inValue.get();
    
    if(newArr.length != arr.length)newArr.length = arr.length;
    
    var i = 0;
    for(i = 0;i < arr.length;i++)
    {
        newArr[i] = Math.max(arr[i],inMax);
    }
    outArray.set(null);
    outArray.set(newArr);
};