const inArray = op.inArray("Array In");
const inValue = op.inValue("Value",1.0);
const outArray = op.outArray("Array Out");

var newArr = [];
outArray.set(newArr);
inArray.onChange =
inValue.onChange = inArray.onChange = function()
{
    var arr = inArray.get();
    if(!arr)return;
    
    var inMin = inValue.get();
    
    if(newArr.length != arr.length)newArr.length = arr.length;
    
    var i = 0;
    for(i = 0;i < arr.length;i++)
    {
        newArr[i] = Math.min(arr[i],inMin);
    }
    outArray.set(null);
    outArray.set(newArr);
};