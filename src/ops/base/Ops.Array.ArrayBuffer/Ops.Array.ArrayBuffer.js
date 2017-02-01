op.name="ArrayStore";


var exec=op.inFunction("exec");

var val=op.inValue("Value");

var arr=[];

var arrOut=op.outArray("Result");

var maxLength=op.inValue("Max Length",100);
arrOut.set(arr);

maxLength.onChange=reset;
reset();

function reset()
{
    arr.length=Math.abs(Math.floor(maxLength.get()))||0;
    for(var i=0;i<arr.length;i++) arr[i]=0;
}

exec.onTriggered=function()
{

    for(var i=1;i<arr.length;i++)arr[i-1]=arr[i];

    arr[arr.length-1]=val.get();
    


};