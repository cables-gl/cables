const inIndex=op.inValue("Index Position"),
    inArr=op.inArray("Array"),
    outX=op.outValue("result");

inIndex.onChange=inArr.onChange=function()
{
    var i=Math.floor(inIndex.get());
    var fr=inIndex.get()-Math.floor(inIndex.get());
    var arr=inArr.get();

    if(i<0 || !arr)
    {
        return;
    }

    if(i>=arr.length-1)
    {
        outX.set(arr[arr.length-1]);
        return;
    }

    var x =  arr[i+0];

    var x2 = arr[i+1];

    x= x + (x2 - x) * fr;

    outX.set(x);
};