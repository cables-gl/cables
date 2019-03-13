const inArray=op.inArray("In");

const outArray=op.outArray("Result");

const newArr=[];
outArray.set(newArr);

inArray.onChange = inArray.onChange=function()
{
    var arr=inArray.get();
    if(!arr)return;

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = Math.ceil(arr[i]);
    }
    outArray.set(null);
    outArray.set(newArr);
};
