op.name="Array2xTo3x";

var inArr=op.inArray("Array2x");
var outArr=op.outArray("Array3x");


var arr=[];

inArr.onChange=function()
{
    var theArray=inArr.get();
    if(!theArray)return;
    
    if((theArray.length/2)*3!=arr.length)
    {
        arr.length=(theArray.length/2)*3;
    }
    
    for(var i=0;i<theArray.length/2;i++)
    {
        arr[i*3+0]=theArray[i*2+0];
        arr[i*3+1]=theArray[i*2+1];
        arr[i*3+2]=0;
    }
    
    outArr.set(null);
    outArr.set(arr);
};