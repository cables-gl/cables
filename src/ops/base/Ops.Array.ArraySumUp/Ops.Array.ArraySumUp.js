var inArr=op.inArray("Array");

var result=op.outValue("Sum");

inArr.onChange=function()
{
    if(inArr.get())
    {
        var arr=inArr.get();
        var sum=0;
        for(var i=0;i<arr.length;i++)
        {
            sum+=Number(arr[i]);
        }
        result.set(sum);
        
    }
    else
    {
        result.set(0);
    }
};