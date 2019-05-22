var inLength=op.inValueInt("Length",100);
var inDefaultValue=op.inValueInt("DefaultValue");
var inReset=op.inTriggerButton("Reset");
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
    var l=parseInt(inLength.get(),10); //why this ?
    //var l=Math.floor(inLength.get());

    //if(l<0)return;
    if(l < 0)
    {
        //outArr.set(null);
        // outArr.length = 0;//this stops array resetting..
        return;
    }

    arr.length=l;

    for(var i=0;i<l;i++)
    {
        arr[i]=inDefaultValue.get();
    }
    outArr.set(null);
    outArr.set(arr);
}

reset();
