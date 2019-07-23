const
    inArr=op.inArray("Array2x"),
    outArr=op.outArray("Array3x"),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length");

var arr=[];
var showingError = false;

inArr.onChange=function()
{
    var theArray=inArr.get();
    if(!theArray)
    {
        outArr.set(null);
        return;
    }

    if(theArray.length%2!=0)
    {
        if(!showingError)
        {
            op.uiAttr({error:"Arrays length not divisible by 2e !"});
            showingError = true;
        }
        outArr.set(null);
        outTotalPoints.set(0);
        outArrayLength.set(0);
        return;
    }
    if(showingError)
    {
        showingError = false;
        op.uiAttr({error:null});
    }

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
    outTotalPoints.set(arr.length/3);
    outArrayLength.set(arr.length);
};