op.name="Array3xTo2x";

var inArr=op.inArray("Array3x");
var outArr=op.outArray("Array2x");


var arr=[];

inArr.onChange=function()
{
    var theArray=inArr.get();
    if(!theArray)return;
    
    if((theArray.length/3)*2!=arr.length)
    {
        arr.length=(theArray.length/3)*2;
    }
    
    for(var i=0;i<theArray.length/3;i++)
    {
        arr[i*2+0]=theArray[i*3+0];
        arr[i*2+1]=theArray[i*3+1];
    }
    
    outArr.set(null);
    outArr.set(arr);
    
    
};