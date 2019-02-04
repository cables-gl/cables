//returns the absolute value of everything in the array

var inArray=op.inArray("In");
var outArray=op.outArray("Result");

var newArr=[];
outArray.set(newArr);

inArray.onChange=function()
{
    var arr=inArray.get();

    if(!arr)return;

    if(newArr.length!=arr.length)newArr.length=arr.length;

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = Math.abs(arr[i]);
    }
    outArray.set(null);
    outArray.set(newArr);
};