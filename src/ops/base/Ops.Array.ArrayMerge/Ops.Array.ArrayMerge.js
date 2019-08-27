const inArr=op.inArray("Array"),
    inArr2=op.inArray("Array 2"),
    outArr=op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

var arr=[];

inArr.onChange=inArr2.onChange=function()
{
    if(!inArr2.get() && !inArr.get())
    {
        outArr.set(null);
        outArrayLength.set(0);
        return;
    }

    if(!inArr2.get() && inArr.get())
    {
        outArr.set(inArr.get());
        return;
    }
    if(inArr2.get() && !inArr.get())
    {
        outArr.set(inArr2.get());
        return;
    }

    arr.length=0;
    arr=arr.concat(inArr.get());
    arr=arr.concat(inArr2.get());

outArr.set(null);
    outArr.set(arr);
    outArrayLength.set(arr.length);
};