var inIndex=op.inValueInt("Index");
var inArr=op.inArray("Array");

var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

inIndex.onChange=inArr.onChange=function()
{
    var i= Math.floor(inIndex.get())*3;
    var arr=inArr.get();

    if(i<0 || !arr)
    {
return;
}
    else
    {
        outX.set(arr[i+0]);
        outY.set(arr[i+1]);
        outZ.set(arr[i+2]);
    }
};