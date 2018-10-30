var DEFAULT_LENGTH=10;

var inVal=op.inValue("Value");
var inWrite=op.inTriggerButton("Write");

var inNum=op.inValueInt("Length",DEFAULT_LENGTH);

var inReset=op.inTriggerButton("Reset Index");

var outArr=op.outArray("Result");
var outIndex=op.outValue("Index");

var index=0;
var arr=[];
inNum.onChange=updateLength;
updateLength();

function updateLength()
{
    arr.length=Math.floor(inNum.get());
    for(var i=0;i<arr.length;i++) arr[i]=0;
    outArr.set(null);
    outArr.set(arr);
    
}

inWrite.onTriggered=function()
{
    index=Math.floor(index%inNum.get());
    arr[index]=inVal.get();
    outIndex.set(index);
    outArr.set(null);
    outArr.set(arr);
    index++;
};

inReset.onTriggered=function()
{
    index=0;
    
};