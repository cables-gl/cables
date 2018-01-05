var exec=op.inFunctionButton("Join");
var inArr=op.inArray("Array");

var outArr=op.outArray("Result");

var arr=[];
outArr.set(arr);

exec.onTriggered=function()
{
    var newArray=inArr.get();
    if(Array.isArray(newArray))
    {
        console.log('merge ',newArray.length);
        arr=arr.concat(newArray);
        outArr.set(null);
        outArr.set(arr);
    }
    
    
};