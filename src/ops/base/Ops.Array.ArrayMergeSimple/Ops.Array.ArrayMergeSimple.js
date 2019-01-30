var inArr=op.inArray("Array");
var inArr2=op.inArray("Array 2");

var outArr=op.outArray("Result");

var arr=[];

inArr.onChange=inArr2.onChange=function()
{
    if(!inArr2.get() && !inArr.get())
    {
        outArr.set(null);
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

    outArr.set(arr);

};