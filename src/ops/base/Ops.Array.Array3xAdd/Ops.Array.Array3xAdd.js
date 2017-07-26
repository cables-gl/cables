op.name="Array3xAdd";

var inArr=op.inArray("Points");
var inX=op.inValue("X");
var inY=op.inValue("Y");
var inZ=op.inValue("Z");

var outArr=op.outArray("Result");

inArr.onChange=function()
{
    var arrr=inArr.get();
    if(!arrr)return;
    var arr=arrr.slice();
    var x=inX.get();
    var y=inY.get();
    var z=inZ.get();
    
    for(var i=0;i<arr.length/2;i++)
    {
        arr[i*2+0]=arr[i*2+0]+x;
        arr[i*2+1]=arr[i*2+1]+y;
        // arr[i*2+2]=arr[i*2+2]+z;
        
        arr[i*2+0]=Math.round(arr[i*2+0]);
        arr[i*2+1]=Math.round(arr[i*2+1]);
        // arr[i*2+2]=Math.round(arr[i*2+2]);
    }
    
    outArr.set(null);
    outArr.set(arr);
    
};