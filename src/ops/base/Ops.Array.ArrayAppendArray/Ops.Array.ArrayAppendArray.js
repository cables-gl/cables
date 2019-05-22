var exec=op.inTriggerButton("Join");
var inArr=op.inArray("Array");
var inReset=op.inTriggerButton("Reset");

var outArr=op.outArray("Result");

var arr=[];
outArr.set(arr);

inReset.onTriggered=function()
{
    //outArr.set(null);
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
    }


};