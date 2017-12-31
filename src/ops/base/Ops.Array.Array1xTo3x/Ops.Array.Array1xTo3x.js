
var inArr=op.inArray("Array2x");
var outArr=op.outArray("Array3x");

var arr=[];

inArr.onChange=function()
{
    var theArray=inArr.get();
    if(!theArray)
    {
        outArr.set(null);
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
};