const exec=op.inTrigger("exec"),
    maxLength=op.inValue("Max Num Elements",100),
    valX=op.inValue("Value X"),
    valY=op.inValue("Value Y"),
    valZ=op.inValue("Value Z"),
    inReset=op.inTriggerButton("Reset"),
    arrOut=op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");
var arr=[];



arrOut.set(arr);

maxLength.onChange=reset;
inReset.onTriggered=reset;
reset();

var wasReset=true;

function reset()
{
    if (maxLength === 0)
    {
        arr.set (null);
        outArrayLength.set(0);
        return;
    }
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
    outArrayLength.set(arr.length);

};