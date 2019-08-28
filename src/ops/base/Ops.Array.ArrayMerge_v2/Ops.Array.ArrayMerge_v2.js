const inArr=op.inArray("Array"),
    inArr2=op.inArray("Array 2"),
    outArr=op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

var arr=[];

inArr.onChange=inArr2.onChange=function()
{
    var arr1 = inArr.get();
    var arr2 = inArr2.get();

    if(!arr1 || !arr2)
    {
        outArr.set(null);
        outArrayLength.set(0);
        return;
    }

    if(arr1 && arr2)
    {
        arr.length=0;
        arr=arr.concat(inArr.get());
        arr=arr.concat(inArr2.get());
    }
    outArr.set(null);
    outArr.set(arr);
    outArrayLength.set(arr.length);
};