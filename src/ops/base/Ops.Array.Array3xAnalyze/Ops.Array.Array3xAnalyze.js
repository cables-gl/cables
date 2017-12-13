var inArr=op.inArray("Array");

var outNum=op.outValue("Num Items");

var outMinX=op.outValue("Min X");
var outMaxX=op.outValue("Max X");
var outAvgX=op.outValue("Average X");

var outMinY=op.outValue("Min Y");
var outMaxY=op.outValue("Max Y");
var outAvgY=op.outValue("Average Y");

var outMinZ=op.outValue("Min Z");
var outMaxZ=op.outValue("Max Z");
var outAvgZ=op.outValue("Average Z");

inArr.onChange=function()
{
    var arr=inArr.get();
    
    var minX=999999999;
    var maxX=-999999999;
    var avgX=0;

    var minZ=999999999;
    var maxZ=-999999999;
    var avgZ=0;

    var minY=999999999;
    var maxY=-999999999;
    var avgY=0;
    outNum.set(0);
    
    if(arr)
    {
        outNum.set(arr.length/3);
    
        for(var i=0;i<arr.length;i+=3)
        {
            avgX+=arr[i];
            minX=Math.min(minX,arr[i]);
            maxX=Math.max(maxX,arr[i]);

            avgY+=arr[i+1];
            minY=Math.min(minY,arr[i+1]);
            maxY=Math.max(maxY,arr[i+1]);

            avgZ+=arr[i+2];
            minZ=Math.min(minZ,arr[i+2]);
            maxZ=Math.max(maxZ,arr[i+2]);
        }

        avgX/=arr.length/3;
        avgY/=arr.length/3;
        avgZ/=arr.length/3;
    }

    outMinX.set(minX);
    outMaxX.set(maxX);
    outAvgX.set(avgX);

    outMinY.set(minY);
    outMaxY.set(maxY);
    outAvgY.set(avgY);

    outMinZ.set(minZ);
    outMaxZ.set(maxZ);
    outAvgZ.set(avgZ);

};