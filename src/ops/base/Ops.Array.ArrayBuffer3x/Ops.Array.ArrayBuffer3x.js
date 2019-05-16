var exec=op.inTrigger("exec");
var maxLength=op.inValue("Max Num Elements",100);

var valX=op.inValue("Value X");
var valY=op.inValue("Value Y");
var valZ=op.inValue("Value Z");

var inReset=op.inTriggerButton("Reset");

var arr=[];

var arrOut=op.outArray("Result");

arrOut.set(arr);

maxLength.onChange=reset;
inReset.onTriggered=reset;
reset();

var wasReset=true;

function reset()
{
    arr.length=Math.abs(Math.floor(maxLength.get()*3))||0;
    for(var i=0;i<arr.length;i++) arr[i]=0;

    wasReset=true;
    arrOut.set(null);
    arrOut.set(arr);
}

exec.onTriggered=function()
{
    // if(op.instanced(exec))return;
    if(wasReset)
    {
        for (var i = 0, len = arr.length; i < len; i+=3)
        {
            arr[i+0]=valX.get();
            arr[i+1]=valY.get();
            arr[i+2]=valZ.get();
        }

        wasReset=false;
    }

    for (var i = 0, len = arr.length; i < len; i++)
        arr[i-3]=arr[i];


    // for(var i=3;i<arr.length;i++)

    arr[arr.length-3]=valX.get();
    arr[arr.length-2]=valY.get();
    arr[arr.length-1]=valZ.get();
    arrOut.set(null);
    arrOut.set(arr);

};