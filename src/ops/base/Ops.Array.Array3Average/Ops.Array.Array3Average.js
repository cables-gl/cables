
var inArr=op.inArray("Array");

var avgX=op.outValue("Average X");
var avgY=op.outValue("Average Y");
var avgZ=op.outValue("Average Z");

inArr.onChange=function()
{

    var arr=inArr.get();
    if(!arr)
    {
        avgX.set(0);
        avgY.set(0);
        avgZ.set(0);
        return;
    }
    var x=0;
    var y=0;
    var z=0;

    for(var i=0;i<arr.length;i+=3)
    {
        x+=arr[i+0];
        y+=arr[i+1];
        z+=arr[i+2];
    }

    avgX.set(x);
    avgY.set(y);
    avgZ.set(z);

};