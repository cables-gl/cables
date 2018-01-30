var inReset=op.inFunctionButton("Reset");
var outArr=op.outArray("Array");

var arr=[];
outArr.set(arr);

inReset.onTriggered=function()
{
    arr.length=0;
    outArr.set(null);
    outArr.set(arr);
};