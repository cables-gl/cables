op.name="ArrayBuffer3x";

var exec=op.inFunction("exec");

var valX=op.inValue("Value X");
var valY=op.inValue("Value Y");
var valZ=op.inValue("Value Z");

var arr=[];

var arrOut=op.outArray("Result");

var maxLength=op.inValue("Max Num Elements",100);
arrOut.set(arr);

maxLength.onChange=reset;
reset();

function reset()
{
    arr.length=Math.abs(Math.floor(maxLength.get()*3))||0;
    for(var i=0;i<arr.length;i++) arr[i]=0;
}

exec.onTriggered=function()
{
    // if(op.instanced(exec))return;

    for (var i = 0, len = arr.length; i < len; i++)
        arr[i-3]=arr[i];


    // for(var i=3;i<arr.length;i++)


    arr[arr.length-3]=valX.get();
    arr[arr.length-2]=valY.get();
    arr[arr.length-1]=valZ.get();
    arrOut.set(null);
arrOut.set(arr);

};