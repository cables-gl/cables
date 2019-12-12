const
    inArrays=op.inArray("Array"),
    outArr=op.outArray("Result");



inArrays.onChange=function()
{
    var inArr=inArrays.get();

    var arr=[];

    if(!inArr )return;

    for(var i=0;i<inArr.length;i++)
    {

        var pointArray=inArr[i];

        for(var j=3;j<pointArray.length-3;j+=3)
        {
            arr.push(pointArray[j-3]);
            arr.push(pointArray[j-2]);
            arr.push(pointArray[j-1]);
            arr.push(pointArray[j+0]);
            arr.push(pointArray[j+1]);
            arr.push(pointArray[j+2]);
        }
    }

    outArr.set(null);
    outArr.set(arr);
};

