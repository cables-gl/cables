op.name="Array";

var inLength=op.inValueInt("Length",100);
var inDefaultValue=op.inValueInt("DefaultValue");
var inReset=op.inFunctionButton("Reset");
var outArr=op.outArray("Array");

var arr=[];
reset();
inReset.onTriggered=reset;
inLength.onChange=reset;

function reset()
{
    outArr.set(arr);
    var l=parseInt(inLength.get(),10);
    if(l<=0)return;
    
    arr.length=l;
    
    for(var i=0;i<l;i++)
    {
        arr[i]=inDefaultValue.get();
    }
    outArr.set(arr);
}


