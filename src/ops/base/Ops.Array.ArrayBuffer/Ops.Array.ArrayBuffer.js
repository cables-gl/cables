const exec=op.inTriggerButton("exec"),
    val=op.inValue("Value"),
    outTrigger = op.outTrigger("Trigger out"),
    arrOut=op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

var arr=[];

var maxLength=op.inInt("Max Length",100);
var inReset=op.inTriggerButton("Reset");
arrOut.set(arr);

maxLength.onChange=reset;
inReset.onTriggered=reset;
reset();

function reset()
{
    arr.length=Math.abs(Math.floor(maxLength.get()))||0;
    for(var i=0;i<arr.length;i++) arr[i]=0;
    arrOut.set(null);
    arrOut.set(arr);
    outArrayLength.set(0);
}

exec.onTriggered=function()
{
    for(var i=1;i<arr.length;i++)arr[i-1]=arr[i];
    arr[arr.length-1]=val.get();
    arrOut.set(null);
    arrOut.set(arr);
    outArrayLength.set(arr.length);
    outTrigger.trigger();
};
