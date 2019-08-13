var inIndex=op.inValue("Index Position");
var inArr=op.inArray("Array");

var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

inIndex.onChange=inArr.onChange=function()
{
    var i=Math.floor(inIndex.get())*3;
    var fr=inIndex.get()-Math.floor(inIndex.get());
    var arr=inArr.get();

    if(i<0 || !arr)
    {
        return;
    }

    if(i<0)return;

    if(i>=arr.length-3)
    {
        outX.set(arr[arr.length-1]);
        outY.set(arr[arr.length-2]);
        outZ.set(arr[arr.length-3]);
        return;
    }


    var x=arr[i+0];
    var y=arr[i+1];
    var z=arr[i+2];

    var x2=arr[i+3];
    var y2=arr[i+4];
    var z2=arr[i+5];


    x=x+ (x2 - x) * fr;
    y=y+ (y2 - y) * fr;
    z=z+ (z2 - z) * fr;

    outX.set(x);
    outY.set(y);
    outZ.set(z);

};