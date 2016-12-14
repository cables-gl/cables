op.name="ArrayGet3Values";

var pArr=op.inArray("Array");

var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

pArr.onChange=function()
{
    var arr=pArr.get();
    if(arr && arr.length>2)
    {
        outX.set(arr[0]);
        outY.set(arr[1]);
        outZ.set(arr[2]);
    }
    
};