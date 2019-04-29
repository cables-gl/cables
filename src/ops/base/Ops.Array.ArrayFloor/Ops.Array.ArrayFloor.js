const inArray=op.inArray("In"),
    outArray=op.outArray("Array out"),
    newArr=[];

outArray.set(newArr);

inArray.onChange = inArray.onChange=function()
{
    var arr=inArray.get();

    if(!arr)return;

    if(newArr.length!=arr.length)newArr.length=arr.length;

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = Math.floor(arr[i]);
    }
    outArray.set(null);
    outArray.set(newArr);
};
