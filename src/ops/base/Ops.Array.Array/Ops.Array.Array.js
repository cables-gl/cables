var inLength=op.inValueInt("Length",100);
var inDefaultValue=op.inValueInt("DefaultValue");
var inReset=op.inFunctionButton("Reset");
var outArr=op.outArray("Array");

var arr=[];
inReset.onTriggered=reset;
inDefaultValue.onChange=reset;
inLength.onChange=function() {
    if (inLength.get()!=arr.length)
        reset();
}

function reset()
{
    outArr.set(arr);
    var l=parseInt(inLength.get(),10);
    if(l<0)return;
    
    arr.length=l;
    
    for(var i=0;i<l;i++)
    {
        arr[i]=inDefaultValue.get();
    }
    outArr.set(null);
    outArr.set(arr);
}

reset();
