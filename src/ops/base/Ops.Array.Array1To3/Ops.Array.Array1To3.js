const inArr=op.inArray("Array1x"),
    outArr=op.outArray("Array3x"),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length");

var arr=[];

inArr.onChange=function()
{
    var theArray=inArr.get();
    if(!theArray)
    {
        outArr.set(null);
        outTotalPoints.set(0);
        outArrayLength.set(0);
        return;
    }

    if((theArray.length)*3!=arr.length)
    {
        arr.length=(theArray.length)*3;
    }

    for(var i=0;i<theArray.length;i++)
    {
        arr[i*3+0]=i;
        arr[i*3+1]=theArray[i];
        arr[i*3+2]=0;
    }

    outArr.set(null);
    outArr.set(arr);
    outTotalPoints.set(arr.length/3);
    outArrayLength.set(arr.length);
};