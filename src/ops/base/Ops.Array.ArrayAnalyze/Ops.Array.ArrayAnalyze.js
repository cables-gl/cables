const
    inArr=op.inArray("Array"),
    outMin=op.outValue("Min"),
    outMax=op.outValue("Max"),
    outAvg=op.outValue("Average");

inArr.onChange=function()
{
    var arr=inArr.get();

    var min=999999999;
    var max=-999999999;
    var avg=0;

    if(arr)
    {
        for(var i=0;i<arr.length;i++)
        {
            avg+=arr[i];
            min=Math.min(min,arr[i]);
            max=Math.max(max,arr[i]);
        }
        avg/=arr.length;
    }
    outMin.set(min);
    outMax.set(max);
    outAvg.set(avg);
};