const inArray=op.inArray("In");

const outArray=op.outArray("Result");

var newArr=[];
outArray.set(newArr);

inArray.onChange=function()
{
    var arr=inArray.get();
    if(!arr)return;

    if(newArr.length!=arr.length)newArr.length=arr.length;

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = Math.ceil(arr[i]);
    }
    outArray.set(null);
    outArray.set(newArr);
};
