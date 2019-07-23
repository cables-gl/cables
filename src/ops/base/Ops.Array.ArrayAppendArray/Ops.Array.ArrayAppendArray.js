const
    exec=op.inTriggerButton("Join"),
    inArr=op.inArray("Array"),
    inReset=op.inTriggerButton("Reset"),
    outArr=op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

var arr=[];
outArr.set(arr);

inReset.onTriggered=function()
{
    outArr.set(null);
    outArrayLength.set(0);
    arr.length=0;
};

exec.onTriggered=function()
{
    var newArray=inArr.get();
    if(Array.isArray(newArray))
    {
        arr=arr.concat(newArray);
        outArr.set(null);
        outArr.set(arr);
        outArrayLength.set(arr.length);
    }
};